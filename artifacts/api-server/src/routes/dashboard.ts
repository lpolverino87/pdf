import { Router, type IRouter } from "express";
import { db, comuniTable, creratoriTable, nazioniTable, moduliTable } from "@workspace/db";
import { sql } from "drizzle-orm";
import { GetDashboardStatsResponse } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/dashboard/stats", async (_req, res): Promise<void> => {
  const [comuniCount, creratoriCount, nazioniCount, moduliCount] = await Promise.all([
    db.select({ count: sql<number>`count(*)::int` }).from(comuniTable),
    db.select({ count: sql<number>`count(*)::int` }).from(creratoriTable),
    db.select({ count: sql<number>`count(*)::int` }).from(nazioniTable),
    db.select({ count: sql<number>`count(*)::int` }).from(moduliTable),
  ]);

  res.json(
    GetDashboardStatsResponse.parse({
      totalComuni: comuniCount[0]?.count ?? 0,
      totalCrematori: creratoriCount[0]?.count ?? 0,
      totalNazioni: nazioniCount[0]?.count ?? 0,
      totalModuli: moduliCount[0]?.count ?? 0,
    }),
  );
});

export default router;
