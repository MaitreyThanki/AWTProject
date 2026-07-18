import { Router } from "express";
import authRoutes from "./authRoutes.js";
import inventoryRoutes from "./inventoryRoutes.js";
import requestRoutes from "./requestRoutes.js";
import approvalRoutes from "./approvalRoutes.js";
import documentRoutes from "./documentRoutes.js";
import penaltyRoutes from "./penaltyRoutes.js";
import dashboardRoutes from "./dashboardRoutes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/items", inventoryRoutes);
router.use("/requests", requestRoutes);
router.use("/approvals", approvalRoutes);
router.use("/documents", documentRoutes);
router.use("/penalties", penaltyRoutes);
router.use("/dashboard", dashboardRoutes);

export default router;

