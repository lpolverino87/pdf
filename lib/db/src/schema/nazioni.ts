import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const nazioniTable = pgTable("nazioni", {
  id: serial("id").primaryKey(),
  nome: text("nome").notNull(),
  consolato: text("consolato"),
  ambasciata: text("ambasciata"),
  telefono: text("telefono"),
  email: text("email"),
  documentiRichiesti: text("documenti_richiesti"),
  procedureRimpatrio: text("procedure_rimpatrio"),
  costiOrienttativi: text("costi_orienttativi"),
  note: text("note"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertNazioneSchema = createInsertSchema(nazioniTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertNazione = z.infer<typeof insertNazioneSchema>;
export type Nazione = typeof nazioniTable.$inferSelect;
