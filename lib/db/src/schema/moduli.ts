import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const moduliTable = pgTable("moduli", {
  id: serial("id").primaryKey(),
  nome: text("nome").notNull(),
  descrizione: text("descrizione"),
  entityType: text("entity_type").notNull().default("generale"),
  entityId: integer("entity_id"),
  url: text("url"),
  note: text("note"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertModuloSchema = createInsertSchema(moduliTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertModulo = z.infer<typeof insertModuloSchema>;
export type Modulo = typeof moduliTable.$inferSelect;
