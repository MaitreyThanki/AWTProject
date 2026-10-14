import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/index.js";

function publicUser(user) {
  return { id: String(user._id), name: user.name, email: user.email, role: user.role };
}

function createToken(user) {
  return jwt.sign(
    { id: String(user._id), email: user.email, role: user.role, name: user.name },
    process.env.JWT_SECRET || "change_this_secret",
    { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
  );
}

export async function registerStudent(req, res, next) {
  try {
    const { name, email, phone, universityProgram, residenceType, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: "Name, email and password are required" });
    const normalizedEmail = String(email).trim().toLowerCase();
    if (await User.exists({ email: normalizedEmail })) return res.status(409).json({ message: "Email is already registered" });
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email: normalizedEmail, phone, universityProgram, residenceType, passwordHash, role: "student" });
    return res.status(201).json({ token: createToken(user), user: publicUser(user) });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ message: "Email is already registered" });
    return next(error);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password, role } = req.body;
    const user = await User.findOne({ email: String(email || "").trim().toLowerCase(), role }).select("+passwordHash");
    if (!user || !(await bcrypt.compare(password || "", user.passwordHash))) {
      return res.status(401).json({ message: "Invalid login details" });
    }
    return res.json({ token: createToken(user), user: publicUser(user) });
  } catch (error) {
    return next(error);
  }
}
