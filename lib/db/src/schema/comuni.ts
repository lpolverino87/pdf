import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const comuniTable = pgTable("comuni", {
  id: serial("id").primaryKey(),
  nome: text("nome").notNull(),
  provincia: text("provincia"),
  orariApertura: text("orari_apertura"),
  necroscopica: text("necroscopica"),
  anagrafeStatoCivile: text("anagrafe_stato_civile"),
  poliziaMoreuaria: text("polizia_mortuaria"),
  cimiteri: text("cimiteri"),
  necroforo: text("necroforo"),
  impresaIncaricataTumulazione: text("impresa_incaricata_tumulazione"),
  tumulazioneCapellaPrivata: text("tumulazione_capella_privata"),
  lapide: text("lapide"),
  affissioni: text("affissioni"),
  luoghiDispersione: text("luoghi_dispersione"),
  listinoDiTumulazione: text("listino_di_tumulazione"),
  appuntamentoAttoMorte: text("appuntamento_atto_morte"),
  moduli: text("moduli"),
  noteCostiPagamento: text("note_costi_pagamento"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertComuneSchema = createInsertSchema(comuniTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertComune = z.infer<typeof insertComuneSchema>;
export type Comune = typeof comuniTable.$inferSelect;
