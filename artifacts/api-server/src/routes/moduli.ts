import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, moduliTable } from "@workspace/db";
import {
  ListModuliQueryParams,
  ListModuliResponse,
  CreateModuloBody,
  CreateModuloResponse,
  GetModuloParams,
  GetModuloResponse,
  UpdateModuloParams,
  UpdateModuloBody,
  UpdateModuloResponse,
  DeleteModuloParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/moduli", async (req, res): Promise<void> => {
  const query = ListModuliQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  const conditions = [];

  if (query.data.entityType) {
    conditions.push(eq(moduliTable.entityType, query.data.entityType));
  }

  if (query.data.entityId != null) {
    conditions.push(eq(moduliTable.entityId, query.data.entityId));
  }

  const rows = await db
    .select()
    .from(moduliTable)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(moduliTable.nome);

  res.json(ListModuliResponse.parse(rows));
});

router.post("/moduli", async (req, res): Promise<void> => {
  const parsed = CreateModuloBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [modulo] = await db.insert(moduliTable).values(parsed.data).returning();
  res.status(201).json(CreateModuloResponse.parse(modulo));
});

router.get("/moduli/:id", async (req, res): Promise<void> => {
  const params = GetModuloParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [modulo] = await db
    .select()
    .from(moduliTable)
    .where(eq(moduliTable.id, params.data.id));

  if (!modulo) {
    res.status(404).json({ error: "Modulo non trovato" });
    return;
  }

  res.json(GetModuloResponse.parse(modulo));
});

router.patch("/moduli/:id", async (req, res): Promise<void> => {
  const params = UpdateModuloParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateModuloBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [modulo] = await db
    .update(moduliTable)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(moduliTable.id, params.data.id))
    .returning();

  if (!modulo) {
    res.status(404).json({ error: "Modulo non trovato" });
    return;
  }

  res.json(UpdateModuloResponse.parse(modulo));
});

router.delete("/moduli/:id", async (req, res): Promise<void> => {
  const params = DeleteModuloParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [modulo] = await db
    .delete(moduliTable)
    .where(eq(moduliTable.id, params.data.id))
    .returning();

  if (!modulo) {
    res.status(404).json({ error: "Modulo non trovato" });
    return;
  }

  res.sendStatus(204);
});

export default router;
