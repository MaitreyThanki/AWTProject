import { Router } from "express";
import {
  createBorrowRequest,
  listRequests,
  getRequestById,
  issueItems,
  returnItems,
  cancelRequest
} from "../controllers/requestController.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";

const router = Router();

// List requests (Student sees own, faculty sees lab, admin sees all)
router.get("/", authenticate, listRequests);
router.get("/:id", authenticate, getRequestById);

// Submit request (Student can attach document files directly during checkout)
router.post(
  "/",
  authenticate,
  authorize("student"),
  upload.array("documents", 5),
  createBorrowRequest
);

// Issue items (Faculty / Admin confirms handover, triggers stock decrement)
router.post("/:id/issue", authenticate, authorize("faculty", "admin"), issueItems);

// Return items (Faculty / Admin confirms return, triggers stock restoration and penalty check)
router.post("/:id/return", authenticate, authorize("faculty", "admin"), returnItems);

// Cancel request
router.post("/:id/cancel", authenticate, cancelRequest);

export default router;
