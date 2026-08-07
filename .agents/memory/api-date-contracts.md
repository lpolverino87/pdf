---
name: Contratti API con date
description: Regola per mantenere coerenti timestamp PostgreSQL, OpenAPI e validazione runtime.
---

I campi timestamp restituiti da Drizzle/PostgreSQL devono essere descritti nello schema OpenAPI come stringhe con formato `date-time`, così Orval genera validazione coerente con le date serializzate nelle risposte HTTP.

**Why:** descrivere i timestamp solo come `string` produceva schemi Zod runtime che rifiutavano gli oggetti `Date` restituiti dalle query, causando 500 sulle liste.

**How to apply:** quando si aggiungono o modificano entità con timestamp, aggiornare prima lo schema OpenAPI con `format: date-time`, rigenerare i client e rieseguire il typecheck completo.