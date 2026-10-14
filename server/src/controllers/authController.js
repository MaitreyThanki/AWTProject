import User from "../models/User.js";
import speakeasy from "speakeasy";
import jwt from "jsonwebtoken";
import speakeasy from "speakeasy";
import { decryptSecret } from "../utils/crypto.js";

export async function adminLogin(req, res) {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        message: "Email and authenticator code are required",
      });
    }

    const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    const submittedEmail = String(email).trim().toLowerCase();
    const secret = process.env.ADMIN_TOTP_SECRET;
    const jwtSecret = process.env.JWT_SECRET;

    if (!adminEmail || !secret || !jwtSecret) {
      console.error("Admin authentication environment is incomplete");

      return res.status(500).json({
        message: "Administrator authentication is not configured",
      });
    }

    if (submittedEmail !== adminEmail) {
      return res.status(401).json({
        message: "Invalid login details",
      });
    }

    const validOtp = speakeasy.totp.verify({
      secret,
      encoding: "base32",
      token: String(otp),
      window: 1,
    });

    if (!validOtp) {
      return res.status(401).json({
        message: "Invalid login details",
      });
    }

    const token = jwt.sign(
      {
        id: "configured-admin",
        email: adminEmail,
        role: "admin",
        name: "Administrator",
      },
      jwtSecret,
      {
        expiresIn: "15m",
        issuer: "inventory-management",
        audience: "inventory-management-api",
      }
    );

    return res.json({
      message: "Administrator login successful",
      token,
      user: {
        email: adminEmail,
        role: "admin",
        name: "Administrator",
      },
    });
  } catch (error) {
    console.error("Admin login failed:", error);

    return res.status(500).json({
      message: "Unable to process administrator login",
    });
  }
}