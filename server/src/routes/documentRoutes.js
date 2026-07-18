import { Router } from "express";
import { uploadDocument } from "../controllers/documentController.js";
import { authenticate } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";

const router = Router();

router.post("/:requestId", authenticate, upload.single("document"), uploadDocument);

export default router;

