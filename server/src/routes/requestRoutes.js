import { Router } from "express";
import { createBorrowRequest, listRequests } from "../controllers/requestController.js";
import { authenticate, authorize } from "../middleware/auth.js";

const router = Router();

router.get("/", authenticate, listRequests);
router.post("/", authenticate, authorize("student"), createBorrowRequest);

export default router;

