import { Router } from "express";
import { createItem, listItems, updateItem } from "../controllers/inventoryController.js";
import { authenticate, authorize } from "../middleware/auth.js";

const router = Router();

router.get("/", authenticate, listItems);
router.post("/", authenticate, authorize("admin", "faculty"), createItem);
router.patch("/:id", authenticate, authorize("admin", "faculty"), updateItem);

export default router;

