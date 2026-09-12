function calculateLayout(frames, cfg) {
 if(!frames.length)return {items:[],width:0,height:0,columns:0,valid:true};
 function pack(cols){let rows=[];for(let i=0;i<frames.length;i+=cols)rows.push(frames.slice(i,i+cols));let width=Math.max(...rows.map(r=>r.reduce((n,f)=>n+f.w,0)+cfg.gap*(r.length-1)));let height=rows.reduce((n,r)=>n+Math.max(...r.map(f=>f.h)),0)+cfg.gap*(rows.length-1);let top=cfg.wallH-cfg.center-height/2,y=top,items=[];for(let row of rows){let rh=Math.max(...row.map(f=>f.h)),rw=row.reduce((n,f)=>n+f.w,0)+cfg.gap*(row.length-1),x=(cfg.wallW-rw)/2;for(let f of row){let fy=y+(cfg.align==='top'?0:cfg.align==='bottom'?rh-f.h:(rh-f.h)/2);items.push({...f,x,y:fy,holes:f.hooks.map(h=>({x:x+f.w-h.x,y:cfg.wallH-fy-h.y})),top:cfg.wallH-fy});x+=f.w+cfg.gap}y+=rh+cfg.gap}return {items,width,height,columns:cols,valid:items.every(f=>f.x>=0&&f.y>=0&&f.x+f.w<=cfg.wallW&&f.y+f.h<=cfg.wallH)}}
 if(cfg.layoutType==='manual')return describeLayout(frames.map(f=>({...f,x:f.px??0,y:f.py??0})),cfg,0);
 if(cfg.layoutType==='compact'){
  function compact(cols){let columns=Array.from({length:cols},()=>[]),heights=Array(cols).fill(0);
   for(let f of frames){let i=heights.indexOf(Math.min(...heights));columns[i].push(f);heights[i]+=f.h+(columns[i].length>1?cfg.gap:0)}
   let widths=columns.map(c=>Math.max(0,...c.map(f=>f.w))),total=widths.reduce((a,b)=>a+b,0)+cfg.gap*(cols-1),x=(cfg.wallW-total)/2,items=[];
   columns.forEach((col,i)=>{let y=cfg.wallH-cfg.center-heights[i]/2;for(let f of col){items.push({...f,x:x+(widths[i]-f.w)/2,y});y+=f.h+cfg.gap}x+=widths[i]+cfg.gap});
   items.sort((a,b)=>frames.findIndex(f=>f.id===a.id)-frames.findIndex(f=>f.id===b.id));return describeLayout(items,cfg,cols);
  }
  if(cfg.columns!=='auto')return compact(Math.min(frames.length,Number(cfg.columns)));
  return frames.map((_,i)=>compact(i+1)).sort((a,b)=>Number(b.valid)-Number(a.valid)||(a.width*a.height*(1+Math.abs(Math.log(a.width/a.height))*0.45)-b.width*b.height*(1+Math.abs(Math.log(b.width/b.height))*0.45)))[0];
 }
 if(cfg.columns!=='auto')return pack(Number(cfg.columns));
 let options=frames.map((_,i)=>pack(i+1)); options.sort((a,b)=> (Number(b.valid)-Number(a.valid)) || (Math.abs(Math.log((a.width/a.height)/1.4))-Math.abs(Math.log((b.width/b.height)/1.4))));return options[0];
}
function describeLayout(items,cfg,columns=0){
 const minX=Math.min(...items.map(f=>f.x)),minY=Math.min(...items.map(f=>f.y));
 let overlap=items.some((a,i)=>items.slice(i+1).some(b=>a.x<b.x+b.w-0.001&&a.x+a.w>b.x+0.001&&a.y<b.y+b.h-0.001&&a.y+a.h>b.y+0.001));
 let gapViolation=items.some((a,i)=>items.slice(i+1).some(b=>gapConflict(a,b,cfg.gap)));
 let bounds=items.every(f=>Number.isFinite(f.x)&&Number.isFinite(f.y)&&f.x>=-0.001&&f.y>=-0.001&&f.x+f.w<=cfg.wallW+0.001&&f.y+f.h<=cfg.wallH+0.001);
 return {items:items.map(f=>({...f,holes:f.hooks.map(h=>({x:f.x+f.w-h.x,y:cfg.wallH-f.y-h.y})),top:cfg.wallH-f.y})),width:items.length?Math.max(...items.map(f=>f.x+f.w))-minX:0,height:items.length?Math.max(...items.map(f=>f.y+f.h))-minY:0,columns,overlap,gapViolation,valid:bounds&&!gapViolation};
}
if(typeof module!=='undefined')module.exports={calculateLayout,describeLayout};

function gapConflict(a,b,gap){return a.x<b.x+b.w+gap-1e-7&&a.x+a.w+gap>b.x+1e-7&&a.y<b.y+b.h+gap-1e-7&&a.y+a.h+gap>b.y+1e-7;}
function placeWithGap(frame,others,x,y,cfg,magnet=false){
 const maxX=cfg.wallW-frame.w,maxY=cfg.wallH-frame.h;if(maxX<0||maxY<0)return null;
 const clamp=(v,max)=>Math.max(0,Math.min(max,v));x=clamp(x,maxX);y=clamp(y,maxY);
 const valid=(a,b)=>others.every(o=>!gapConflict({...frame,x:a,y:b},o,cfg.gap));
 const xs=[x,0,maxX],ys=[y,0,maxY];
 for(const o of others){xs.push(o.x-frame.w-cfg.gap,o.x+o.w+cfg.gap);ys.push(o.y-frame.h-cfg.gap,o.y+o.h+cfg.gap);}
 if(magnet){let sx=x,sy=y,dx=2,dy=2;for(const o of others){if(y<o.y+o.h&&y+frame.h>o.y)for(const v of [o.x-frame.w-cfg.gap,o.x+o.w+cfg.gap])if(Math.abs(v-x)<dx){sx=v;dx=Math.abs(v-x)}if(x<o.x+o.w&&x+frame.w>o.x)for(const v of [o.y-frame.h-cfg.gap,o.y+o.h+cfg.gap])if(Math.abs(v-y)<dy){sy=v;dy=Math.abs(v-y)}}if(sx>=0&&sx<=maxX&&sy>=0&&sy<=maxY&&valid(sx,sy))return {x:sx,y:sy};}
 let best=null,score=Infinity;for(const a of xs)for(const b of ys){if(a<0||a>maxX||b<0||b>maxY)continue;let d=(a-x)**2+(b-y)**2;if(d<score&&valid(a,b)){best={x:a,y:b};score=d;}}return best;
}
function findAlignment(rect,others){
 const tol=2;let bestX=null,bestY=null;
 for(const o of others){
  for(const [mine,val] of [[rect.x,o.x],[rect.x+rect.w/2,o.x+o.w/2],[rect.x+rect.w,o.x+o.w]]){let d=Math.abs(mine-val);if(d<tol&&(!bestX||d<bestX.d))bestX={d,val,shift:val-mine,id:o.id};}
  for(const [mine,val] of [[rect.y,o.y],[rect.y+rect.h/2,o.y+o.h/2],[rect.y+rect.h,o.y+o.h]]){let d=Math.abs(mine-val);if(d<tol&&(!bestY||d<bestY.d))bestY={d,val,shift:val-mine,id:o.id};}
 }
 return {x:bestX?rect.x+bestX.shift:rect.x,y:bestY?rect.y+bestY.shift:rect.y,guideX:bestX,guideY:bestY};
}
if(typeof module!=='undefined')Object.assign(module.exports,{gapConflict,placeWithGap,findAlignment});
