import { Router } from "express";
import {
  decideRequest,
  overrideDecision,
  listOverrideLogs
} from "../controllers/approvalController.js";
import { authenticate, authorize } from "../middleware/auth.js";

const router = Router();

// Faculty / Admin approval decision
router.patch("/:id/decision", authenticate, authorize("faculty", "admin"), decideRequest);

// Admin Override (Doc 4.4.6)
router.post("/:id/override", authenticate, authorize("admin"), overrideDecision);
router.get("/overrides", authenticate, authorize("admin"), listOverrideLogs);

export default router;
