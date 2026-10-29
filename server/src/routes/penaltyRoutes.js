import { Router } from "express";
import {
  listPenalties,
  createPenalty,
  updatePenaltyStatus
} from "../controllers/penaltyController.js";
import { authenticate, authorize } from "../middleware/auth.js";

const router = Router();

router.get("/", authenticate, listPenalties);
router.post("/", authenticate, authorize("admin", "faculty"), createPenalty);
router.patch("/:id/status", authenticate, authorize("admin", "faculty"), updatePenaltyStatus);

export default router;
