---
name: Transizione PostgreSQL esterno
description: Decisione per usare Neon durante la transizione da un database PostgreSQL gestito dalla piattaforma
---

Durante una migrazione da un database gestito da Replit a Neon, non sostituire
né modificare `DATABASE_URL`: usare una variabile segreta separata per la
connessione Neon e applicare una precedenza esplicita solo nell’applicazione.

**Why:** Replit tratta `DATABASE_URL` come variabile runtime gestita e può
impedire di impostarla manualmente; un alias evita conflitti e permette di
passare gradualmente al database esterno.

**How to apply:** usare l’alias Neon nell’ambiente Replit di transizione e
`DATABASE_URL` nell’ambiente Vercel, mantenendo le stesse query e lo stesso
schema PostgreSQL.