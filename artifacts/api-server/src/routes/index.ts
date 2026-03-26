import { Router, type IRouter } from "express";
import healthRouter from "./health";
import audiobookRouter from "./audiobook";

const router: IRouter = Router();

router.use(healthRouter);
router.use(audiobookRouter);

export default router;
