import { Router } from "express";
import { login, registerStudent } from "../controllers/authController.js";

const router = Router();

router.post("/student/register", registerStudent);
router.post("/login", login);

export default router;

