import { Router } from "express";
import {
  login,
  registerStudent,
  adminLogin,
} from "../controllers/authController.js";

const router = Router();

router.post("/student/register", registerStudent);
router.post("/login", login);
router.post("/admin/login", adminLogin);

export default router;