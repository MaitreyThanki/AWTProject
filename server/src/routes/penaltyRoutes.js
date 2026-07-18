import { Router } from "express";
import { createPenalty, listPenalties } from "../controllers/penaltyController.js";
import { authenticate, authorize } from "../middleware/auth.js";

const router = Router();

router.get("/", authenticate, listPenalties);
router.post("/", authenticate, authorize("admin", "faculty"), createPenalty);

export default router;

