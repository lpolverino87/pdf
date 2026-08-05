import { Router, type IRouter } from "express";
import { eq, ilike, or, sql } from "drizzle-orm";
import { db, comuniTable } from "@workspace/db";
import {
  ListComuniQueryParams,
  ListComuniResponse,
  CreateComuneBody,
  CreateComuneResponse,
  GetComuneParams,
  GetComuneResponse,
  UpdateComuneParams,
  UpdateComuneBody,
  UpdateComuneResponse,
  DeleteComuneParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/comuni", async (req, res): Promise<void> => {
  const query = ListComuniQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  let dbQuery = db.select().from(comuniTable);

  if (query.data.search) {
    const term = `%${query.data.search}%`;
    const filtered = db
      .select()
      .from(comuniTable)
      .where(
        or(
          ilike(comuniTable.nome, term),
          ilike(comuniTable.provincia ?? sql`''`, term),
        ),
      );
    const rows = await filtered.orderBy(comuniTable.nome);
    res.json(ListComuniResponse.parse(rows));
    return;
  }

  if (query.data.provincia) {
    const term = `%${query.data.provincia}%`;
    const rows = await db
      .select()
      .from(comuniTable)
      .where(ilike(comuniTable.provincia ?? sql`''`, term))
      .orderBy(comuniTable.nome);
    res.json(ListComuniResponse.parse(rows));
    return;
  }

  const rows = await db.select().from(comuniTable).orderBy(comuniTable.nome);
  res.json(ListComuniResponse.parse(rows));
});

router.post("/comuni", async (req, res): Promise<void> => {
  const parsed = CreateComuneBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [comune] = await db.insert(comuniTable).values(parsed.data).returning();
  res.status(201).json(CreateComuneResponse.parse(comune));
});

router.get("/comuni/:id", async (req, res): Promise<void> => {
  const params = GetComuneParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [comune] = await db
    .select()
    .from(comuniTable)
    .where(eq(comuniTable.id, params.data.id));

  if (!comune) {
    res.status(404).json({ error: "Comune non trovato" });
    return;
  }

  res.json(GetComuneResponse.parse(comune));
});

router.patch("/comuni/:id", async (req, res): Promise<void> => {
  const params = UpdateComuneParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateComuneBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [comune] = await db
    .update(comuniTable)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(comuniTable.id, params.data.id))
    .returning();

  if (!comune) {
    res.status(404).json({ error: "Comune non trovato" });
    return;
  }

  res.json(UpdateComuneResponse.parse(comune));
});

router.delete("/comuni/:id", async (req, res): Promise<void> => {
  const params = DeleteComuneParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [comune] = await db
    .delete(comuniTable)
    .where(eq(comuniTable.id, params.data.id))
    .returning();

  if (!comune) {
    res.status(404).json({ error: "Comune non trovato" });
    return;
  }

  res.sendStatus(204);
});

export default router;
