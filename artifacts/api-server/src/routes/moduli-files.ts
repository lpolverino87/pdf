import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, moduliTable } from "@workspace/db";
import {
  CompleteModuloFileUploadBody,
  CompleteModuloFileUploadResponse,
  DeleteModuloFileParams,
  GetModuloFileUrlParams,
  GetModuloFileUrlResponse,
  GetModuloParams,
  RequestModuloFileUploadBody,
  RequestModuloFileUploadResponse,
} from "@workspace/api-zod";
import {
  createModuloDownloadUrl,
  createModuloUploadUrl,
  deleteModuloFileFromR2,
} from "../lib/r2";

const router: IRouter = Router();

function fileKeyForModulo(id: number, fileName: string) {
  const safeName = fileName
    .normalize("NFKD")
    .replace(/[^\w.\-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(-120) || "documento.pdf";

  return `moduli/${id}/${crypto.randomUUID()}-${safeName}`;
}

function isModuloFileKey(id: number, fileKey: string) {
  return fileKey.startsWith(`moduli/${id}/`) && !fileKey.includes("..");
}

router.post("/moduli/:id/file-upload-url", async (req, res): Promise<void> => {
  const params = GetModuloParams.safeParse(req.params);
  const body = RequestModuloFileUploadBody.safeParse(req.body);

  if (!params.success || !body.success) {
    res.status(400).json({ error: "Dati PDF non validi" });
    return;
  }

  const [modulo] = await db
    .select({ id: moduliTable.id })
    .from(moduliTable)
    .where(eq(moduliTable.id, params.data.id));

  if (!modulo) {
    res.status(404).json({ error: "Modulo non trovato" });
    return;
  }

  const fileKey = fileKeyForModulo(modulo.id, body.data.fileName);
  const uploadUrl = await createModuloUploadUrl({
    fileKey,
    fileSize: body.data.fileSize,
  });

  res.json(RequestModuloFileUploadResponse.parse({ uploadUrl, fileKey }));
});

router.post("/moduli/:id/file", async (req, res): Promise<void> => {
  const params = GetModuloParams.safeParse(req.params);
  const body = CompleteModuloFileUploadBody.safeParse(req.body);

  if (!params.success || !body.success) {
    res.status(400).json({ error: "Metadati PDF non validi" });
    return;
  }

  if (!isModuloFileKey(params.data.id, body.data.fileKey)) {
    res.status(400).json({ error: "Percorso PDF non valido" });
    return;
  }

  const [current] = await db
    .select()
    .from(moduliTable)
    .where(eq(moduliTable.id, params.data.id));

  if (!current) {
    res.status(404).json({ error: "Modulo non trovato" });
    return;
  }

  const [modulo] = await db
    .update(moduliTable)
    .set({
      fileKey: body.data.fileKey,
      fileName: body.data.fileName,
      fileSize: body.data.fileSize,
      fileMimeType: body.data.fileMimeType,
      url: null,
      updatedAt: new Date(),
    })
    .where(eq(moduliTable.id, params.data.id))
    .returning();

  if (current.fileKey && current.fileKey !== body.data.fileKey) {
    await deleteModuloFileFromR2(current.fileKey);
  }

  res.json(CompleteModuloFileUploadResponse.parse(modulo));
});

router.get("/moduli/:id/file", async (req, res): Promise<void> => {
  const params = GetModuloFileUrlParams.safeParse(req.params);

  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [modulo] = await db
    .select({ fileKey: moduliTable.fileKey })
    .from(moduliTable)
    .where(eq(moduliTable.id, params.data.id));

  if (!modulo?.fileKey || !isModuloFileKey(params.data.id, modulo.fileKey)) {
    res.status(404).json({ error: "PDF non trovato" });
    return;
  }

  const downloadUrl = await createModuloDownloadUrl(modulo.fileKey);
  res.json(GetModuloFileUrlResponse.parse({ downloadUrl }));
});

router.delete("/moduli/:id/file", async (req, res): Promise<void> => {
  const params = DeleteModuloFileParams.safeParse(req.params);

  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [current] = await db
    .select()
    .from(moduliTable)
    .where(eq(moduliTable.id, params.data.id));

  if (!current) {
    res.status(404).json({ error: "Modulo non trovato" });
    return;
  }

  if (current.fileKey && isModuloFileKey(params.data.id, current.fileKey)) {
    await deleteModuloFileFromR2(current.fileKey);
  }

  await db
    .update(moduliTable)
    .set({
      fileKey: null,
      fileName: null,
      fileSize: null,
      fileMimeType: null,
      updatedAt: new Date(),
    })
    .where(eq(moduliTable.id, params.data.id));

  res.sendStatus(204);
});

export default router;