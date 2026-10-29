import { Router } from "express";
import { getDashboard } from "../controllers/dashboardController.js";
import { authenticate, authorize } from "../middleware/auth.js";

const router = Router();

// Any authenticated user can access the shared dashboard endpoint.
// Keep this if students and faculty also use it.
router.get("/", authenticate, getDashboard);

// If this endpoint is exclusively for administrators,
// use this pattern instead:
// router.get("/", authenticate, authorize("admin"), getDashboard); 

export default router;
