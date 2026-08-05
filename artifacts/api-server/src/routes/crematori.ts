import { Router, type IRouter } from "express";
import { eq, ilike } from "drizzle-orm";
import { db, creratoriTable } from "@workspace/db";
import {
  ListCrematoriQueryParams,
  ListCrematoriResponse,
  CreateCrematorioBody,
  CreateCrematorioResponse,
  GetCrematorioParams,
  GetCrematorioResponse,
  UpdateCrematorioParams,
  UpdateCrematorioBody,
  UpdateCrematorioResponse,
  DeleteCrematorioParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/crematori", async (req, res): Promise<void> => {
  const query = ListCrematoriQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  if (query.data.search) {
    const term = `%${query.data.search}%`;
    const rows = await db
      .select()
      .from(creratoriTable)
      .where(ilike(creratoriTable.nome, term))
      .orderBy(creratoriTable.nome);
    res.json(ListCrematoriResponse.parse(rows));
    return;
  }

  const rows = await db.select().from(creratoriTable).orderBy(creratoriTable.nome);
  res.json(ListCrematoriResponse.parse(rows));
});

router.post("/crematori", async (req, res): Promise<void> => {
  const parsed = CreateCrematorioBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [crematorio] = await db.insert(creratoriTable).values(parsed.data).returning();
  res.status(201).json(CreateCrematorioResponse.parse(crematorio));
});

router.get("/crematori/:id", async (req, res): Promise<void> => {
  const params = GetCrematorioParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [crematorio] = await db
    .select()
    .from(creratoriTable)
    .where(eq(creratoriTable.id, params.data.id));

  if (!crematorio) {
    res.status(404).json({ error: "Crematorio non trovato" });
    return;
  }

  res.json(GetCrematorioResponse.parse(crematorio));
});

router.patch("/crematori/:id", async (req, res): Promise<void> => {
  const params = UpdateCrematorioParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateCrematorioBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [crematorio] = await db
    .update(creratoriTable)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(creratoriTable.id, params.data.id))
    .returning();

  if (!crematorio) {
    res.status(404).json({ error: "Crematorio non trovato" });
    return;
  }

  res.json(UpdateCrematorioResponse.parse(crematorio));
});

router.delete("/crematori/:id", async (req, res): Promise<void> => {
  const params = DeleteCrematorioParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [crematorio] = await db
    .delete(creratoriTable)
    .where(eq(creratoriTable.id, params.data.id))
    .returning();

  if (!crematorio) {
    res.status(404).json({ error: "Crematorio non trovato" });
    return;
  }

  res.sendStatus(204);
});

export default router;
