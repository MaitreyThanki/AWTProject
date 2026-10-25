import { Router } from "express";
import {
  listItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
  getItemHistory,
  listLabs
} from "../controllers/inventoryController.js";
import { authenticate, authorize } from "../middleware/auth.js";

const router = Router();

// Labs list (public/authenticated)
router.get("/labs", listLabs);

// Items list and single item
router.get("/", authenticate, listItems);
router.get("/:id", authenticate, getItemById);
router.get("/:id/history", authenticate, getItemHistory);

// Admin and faculty modification
router.post("/", authenticate, authorize("admin", "faculty"), createItem);
router.patch("/:id", authenticate, authorize("admin", "faculty"), updateItem);
router.delete("/:id", authenticate, authorize("admin"), deleteItem);

export default router;
