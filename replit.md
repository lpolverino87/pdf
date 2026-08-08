# Modulistica Comuni

Applicazione interna per consultare rapidamente comuni, crematori, nazioni e
moduli/documenti per un’impresa di onoranze funebri.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string
- PDF storage: `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`,
  `R2_BUCKET_NAME`

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/comuni-app` — frontend React/Vite e pagine CRUD
- `artifacts/api-server` — API Express e URL firmati per i PDF
- `lib/db/src/schema` — schema Drizzle/PostgreSQL
- `lib/api-spec/openapi.yaml` — contratto API sorgente
- `docs/DEPLOYMENT.md` — passaggi per Neon, Cloudflare R2 e Vercel

## Architecture decisions

- I PDF sono salvati su Cloudflare R2; il database conserva solo metadati e
  `fileKey`.
- L’upload usa un URL firmato diretto dal browser e il download usa un URL
  temporaneo, senza proxy dei bytes attraverso l’API.
- I vecchi moduli con `url` restano apribili come collegamenti legacy finché non
  vengono sostituiti da un PDF.

## Product

- Dashboard con statistiche.
- Archivio dei 42 comuni della provincia di Reggio Emilia.
- Schede per comuni, crematori e nazioni.
- CRUD dei moduli collegabili alle entità o generali.
- Caricamento, apertura, sostituzione e cancellazione dei PDF.

## User preferences

- L’app è privata e destinata all’uso interno di un’impresa di onoranze
  funebri italiana.
- La destinazione prevista fuori da Replit è Neon + Cloudflare R2 + Vercel.

## Gotchas

- Dopo ogni modifica a `lib/api-spec/openapi.yaml` rigenerare gli artefatti
  client/Zod con il codegen OpenAPI.
- In Replit i workflow forniscono `PORT` e `BASE_PATH`; Vite ora usa valori
  predefiniti per consentire il build su Vercel.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
