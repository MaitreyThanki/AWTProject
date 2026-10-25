import { Router } from "express";
import {
  login,
  registerStudent,
  adminLogin,
  createFacultyAccount,
  changePassword,
  getMe
} from "../controllers/authController.js";
import { authenticate, authorize } from "../middleware/auth.js";

const router = Router();

router.post("/student/register", registerStudent);
router.post("/login", login);
router.post("/admin/login", adminLogin);
router.post("/faculty/create", authenticate, authorize("admin"), createFacultyAccount);
router.post("/change-password", authenticate, changePassword);
router.get("/me", authenticate, getMe);

export default router;
