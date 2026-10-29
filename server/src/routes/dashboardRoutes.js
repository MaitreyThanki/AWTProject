import { Router } from "express";
import {
  getDashboard,
  getAnalyticsData,
  getStudentClearance
} from "../controllers/dashboardController.js";
import { authenticate, authorize } from "../middleware/auth.js";


const router = Router();

// Dashboard overview metrics
router.get("/", authenticate, getDashboard);

// Visual Analytics & Lab Insights aggregation
router.get("/analytics", authenticate, getAnalyticsData);

// Student No-Dues Clearance Eligibility Check
router.get("/no-dues-clearance", authenticate, authorize("student"), getStudentClearance);

export default router;

