import { Router } from "express";
import {
  uploadDocument,
  listDocuments,
  getDocumentFile
} from "../controllers/documentController.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";

const router = Router();

// Upload document for request
router.post("/upload/:requestId", authenticate, upload.single("document"), uploadDocument);

// Document review (Admin / Faculty)
router.get("/", authenticate, authorize("admin", "faculty"), listDocuments);

// Secure download / preview
router.get("/:id/file", authenticate, getDocumentFile);

export default router;
