# Pubblicazione esterna

L’applicazione è composta da:

- frontend React/Vite in `artifacts/comuni-app`
- API Express condivisa in `artifacts/api-server`
- PostgreSQL tramite Drizzle
- PDF su Cloudflare R2 tramite URL firmati S3

La configurazione `vercel.json` usa i builder Vercel per pubblicare il frontend
come sito statico e inoltra `/api/*` alla function Node catch-all
`api/[...path].ts`, che riusa l’app Express esistente. Nel progetto Vercel
lasciare vuoto il campo **Root Directory**, così il monorepo viene letto dalla
radice.

## Variabili d’ambiente

Configurare in Vercel, senza inserirle nel repository:

- `DATABASE_URL`: connection string del database Neon, con `sslmode=require`
- `NEON_DATABASE_URL`: alias opzionale per usare Neon durante la transizione su
  Replit, dove `DATABASE_URL` è gestita automaticamente
- `R2_ACCOUNT_ID`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `R2_BUCKET_NAME`

Quando sono presenti entrambe, `NEON_DATABASE_URL` ha precedenza su
`DATABASE_URL`. In Vercel è sufficiente usare `DATABASE_URL`.

`PORT` e `BASE_PATH` servono solo per l’esecuzione locale/Replit; il frontend
usa `/` come base predefinita quando Vercel non li fornisce.

## Neon

1. Creare un database Neon PostgreSQL.
2. Esportare il database attuale in un file locale, ad esempio con `pg_dump`.
3. Importare il dump nel database Neon.
4. Impostare `DATABASE_URL` in Vercel e nel nuovo ambiente locale.
5. Verificare almeno `GET /api/healthz`, dashboard, comuni e moduli prima di
   dismettere il database precedente.

Non eseguire il dump o l’import con credenziali salvate nel repository.

## Cloudflare R2

1. Creare un bucket privato.
2. Creare una chiave API con permessi di lettura/scrittura sul bucket.
3. Impostare le quattro variabili `R2_*` in Vercel.
4. Configurare la regola CORS del bucket per consentire:
   - `PUT` dal dominio Vercel dell’app
   - header `Content-Type`
   - header `Content-Length`
5. Provare un caricamento PDF, apertura e cancellazione.

I PDF non vengono inseriti nel database: PostgreSQL conserva solo chiave,
nome, dimensione e tipo MIME. Gli URL di upload e apertura sono temporanei.

## Verifica locale

```bash
pnpm run typecheck
pnpm --filter @workspace/comuni-app run build
pnpm --filter @workspace/api-server run build
```

Per l’avvio su Replit restano validi i workflow esistenti:

```bash
pnpm --filter @workspace/api-server run dev
pnpm --filter @workspace/comuni-app run dev
```