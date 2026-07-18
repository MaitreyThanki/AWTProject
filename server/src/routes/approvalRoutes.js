import { Router } from "express";
import { decideRequest } from "../controllers/approvalController.js";
import { authenticate, authorize } from "../middleware/auth.js";

const router = Router();

router.patch("/:id/decision", authenticate, authorize("faculty", "admin"), decideRequest);

export default router;

