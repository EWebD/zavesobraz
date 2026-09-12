# Obrazovňa — plánovač zavesenia obrazov

Webová appka na rozloženie rámov na stene a výpočet presných bodov na vŕtanie. Bez backendu — všetko beží v prehliadači, rozloženie sa ukladá v `localStorage`.

**Appka beží na:** https://zavesobraz.malobicky-e.workers.dev

## Spustenie appky u seba

Potrebuješ [Node.js](https://nodejs.org).

- **macOS:** dvojklik na `pustit-appku.command` v priečinku projektu — appka sa spustí a otvorí v prehliadači.
- **Alebo v termináli:**
  ```
  npm start
  ```
  otvorí appku na `http://localhost:8080`.

## Nasadenie na Cloudflare

Appka beží ako Cloudflare Worker so statickými assetmi. Po zmenách ju znova nasadíš príkazom:

```
npm install   # len prvý raz
npm run deploy
```

Vyžaduje prihlásenie cez `wrangler login` (spustí sa automaticky, ak ešte nie si prihlásený).
