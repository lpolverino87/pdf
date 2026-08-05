import { Router, type IRouter } from "express";
import { eq, ilike } from "drizzle-orm";
import { db, nazioniTable } from "@workspace/db";
import {
  ListNazioniQueryParams,
  ListNazioniResponse,
  CreateNazioneBody,
  CreateNazioneResponse,
  GetNazioneParams,
  GetNazioneResponse,
  UpdateNazioneParams,
  UpdateNazioneBody,
  UpdateNazioneResponse,
  DeleteNazioneParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/nazioni", async (req, res): Promise<void> => {
  const query = ListNazioniQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  if (query.data.search) {
    const term = `%${query.data.search}%`;
    const rows = await db
      .select()
      .from(nazioniTable)
      .where(ilike(nazioniTable.nome, term))
      .orderBy(nazioniTable.nome);
    res.json(ListNazioniResponse.parse(rows));
    return;
  }

  const rows = await db.select().from(nazioniTable).orderBy(nazioniTable.nome);
  res.json(ListNazioniResponse.parse(rows));
});

router.post("/nazioni", async (req, res): Promise<void> => {
  const parsed = CreateNazioneBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [nazione] = await db.insert(nazioniTable).values(parsed.data).returning();
  res.status(201).json(CreateNazioneResponse.parse(nazione));
});

router.get("/nazioni/:id", async (req, res): Promise<void> => {
  const params = GetNazioneParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [nazione] = await db
    .select()
    .from(nazioniTable)
    .where(eq(nazioniTable.id, params.data.id));

  if (!nazione) {
    res.status(404).json({ error: "Nazione non trovata" });
    return;
  }

  res.json(GetNazioneResponse.parse(nazione));
});

router.patch("/nazioni/:id", async (req, res): Promise<void> => {
  const params = UpdateNazioneParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateNazioneBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [nazione] = await db
    .update(nazioniTable)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(nazioniTable.id, params.data.id))
    .returning();

  if (!nazione) {
    res.status(404).json({ error: "Nazione non trovata" });
    return;
  }

  res.json(UpdateNazioneResponse.parse(nazione));
});

router.delete("/nazioni/:id", async (req, res): Promise<void> => {
  const params = DeleteNazioneParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [nazione] = await db
    .delete(nazioniTable)
    .where(eq(nazioniTable.id, params.data.id))
    .returning();

  if (!nazione) {
    res.status(404).json({ error: "Nazione non trovata" });
    return;
  }

  res.sendStatus(204);
});

export default router;
