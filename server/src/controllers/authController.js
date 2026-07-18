import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/index.js";

function createToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    process.env.JWT_SECRET || "change_this_secret",
    { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
  );
}

export async function registerStudent(req, res, next) {
  try {
    const { name, email, phone, universityProgram, residenceType, password } = req.body;
    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      phone,
      universityProgram,
      residenceType,
      passwordHash,
      role: "student"
    });

    res.status(201).json({ token: createToken(user), user: { id: user.id, name, email, role: user.role } });
  } catch (error) {
    next(error);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password, role } = req.body;
    const user = await User.findOne({ where: { email, role } });

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ message: "Invalid login details" });
    }

    return res.json({
      token: createToken(user),
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    return next(error);
  }
}

