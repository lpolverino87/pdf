import { Router, type IRouter } from "express";
import healthRouter from "./health";
import comuniRouter from "./comuni";
import creratoriRouter from "./crematori";
import nazioniRouter from "./nazioni";
import moduliRouter from "./moduli";
import dashboardRouter from "./dashboard";

const router: IRouter = Router();

router.use(healthRouter);
router.use(comuniRouter);
router.use(creratoriRouter);
router.use(nazioniRouter);
router.use(moduliRouter);
router.use(dashboardRouter);

export default router;
