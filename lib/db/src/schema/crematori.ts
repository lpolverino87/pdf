import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const creratoriTable = pgTable("crematori", {
  id: serial("id").primaryKey(),
  nome: text("nome").notNull(),
  citta: text("citta"),
  provincia: text("provincia"),
  indirizzo: text("indirizzo"),
  telefono: text("telefono"),
  email: text("email"),
  orariApertura: text("orari_apertura"),
  referente: text("referente"),
  costiCremazione: text("costi_cremazione"),
  modalitaPrenotazione: text("modalita_prenotazione"),
  documentiRichiesti: text("documenti_richiesti"),
  note: text("note"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertCrematorioSchema = createInsertSchema(creratoriTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertCrematorio = z.infer<typeof insertCrematorioSchema>;
export type Crematorio = typeof creratoriTable.$inferSelect;
