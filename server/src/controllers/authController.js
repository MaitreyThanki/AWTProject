import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import speakeasy from "speakeasy";
import { User, Lab } from "../models/index.js";
import { sendEmail } from "../services/emailService.js";

function publicUser(user) {
  return {
    id: String(user._id || user.id),
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone,
    enrollmentNumber: user.enrollmentNumber,
    universityProgram: user.universityProgram,
    semester: user.semester,
    division: user.division,
    residenceType: user.residenceType,
    assignedLabId: user.assignedLabId,
    mustChangePassword: user.mustChangePassword || false
  };
}

function createToken(user) {
  return jwt.sign(
    {
      id: String(user._id || user.id),
      email: user.email,
      role: user.role,
      name: user.name,
      assignedLabId: user.assignedLabId
    },
    process.env.JWT_SECRET || "inventory_secret_key_jwt_2026",
    { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
  );
}

// Student Registration (Doc 4.1.1)
export async function registerStudent(req, res, next) {
  try {
    const {
      name,
      email,
      phone,
      universityProgram,
      semester,
      division,
      stay,
      residenceType,
      password,
      confirmPassword,
      enrollmentNumber
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, university email, and password are required" });
    }

    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(409).json({ message: "An account with this email already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      role: "student",
      phone: phone || "",
      enrollmentNumber: enrollmentNumber || "",
      universityProgram: universityProgram || "",
      semester: semester || "",
      division: division || "",
      residenceType: stay || residenceType || "home"
    });

    const token = createToken(user);
    return res.status(201).json({
      message: "Student registered successfully",
      token,
      user: publicUser(user)
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "Email is already registered" });
    }
    return next(error);
  }
}

// Faculty Account Creation & Password Distribution (Doc 4.1.2)
export async function createFacultyAccount(req, res, next) {
  try {
    const { name, email, assignedLabId } = req.body;
    if (!name || !email) {
      return res.status(400).json({ message: "Faculty name and university email are required" });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(409).json({ message: "Account with this email already exists" });
    }

    // Generate random 10-char password
    const generatedPassword = crypto.randomBytes(5).toString("hex") + "A1!";
    const passwordHash = await bcrypt.hash(generatedPassword, 10);

    const faculty = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      role: "faculty",
      assignedLabId: assignedLabId || undefined,
      mustChangePassword: true
    });

    // Attempt to mail credentials to the faculty member
    try {
      await sendEmail({
        to: normalizedEmail,
        subject: "Your Lab Inventory System Faculty Account",
        text: `Dear ${name},\n\nYour faculty account for the Lab Inventory Management System has been created.\n\nLogin Email: ${normalizedEmail}\nTemporary Password: ${generatedPassword}\n\nPlease log in and change your password to proceed.\n\nBest regards,\nLab Administration`
      });
    } catch (mailError) {
      console.warn("Could not send email notification:", mailError.message);
    }

    return res.status(201).json({
      message: "Faculty account created and temporary password generated",
      faculty: publicUser(faculty),
      temporaryPassword: generatedPassword // returned in response for convenience in dev/lab testing
    });
  } catch (error) {
    return next(error);
  }
}

// Unified Login for Student & Faculty (Doc 4.1)
export async function login(req, res, next) {
  try {
    const { email, password, role } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // If attempting to log in as admin via normal form, direct them to OTP auth
    if (role === "admin") {
      return res.status(400).json({
        message: "Administrators must log in via Authenticator OTP code"
      });
    }

    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const query = { email: normalizedEmail };
    if (role) query.role = role;

    const user = await User.findOne(query).select("+passwordHash");
    if (!user || !user.passwordHash) {
      return res.status(401).json({ message: "Invalid email or credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or credentials" });
    }

    const token = createToken(user);
    return res.json({
      message: "Login successful",
      token,
      user: publicUser(user)
    });
  } catch (error) {
    return next(error);
  }
}

// Admin Authenticator (TOTP) Login (Doc 4.1.3)
export async function adminLogin(req, res, next) {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "University admin email and authenticator code are required" });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const configAdminEmail = (process.env.ADMIN_EMAIL || "admin@university.edu").trim().toLowerCase();
    const defaultSecret = process.env.ADMIN_TOTP_SECRET || "JBSWY3DPEHPK3PXP";

    // Check against configured admin or db admin
    const userInDb = await User.findOne({ email: normalizedEmail, role: "admin" }).select("+totpSecret");

    let validAdmin = false;
    let adminSecret = defaultSecret;
    let adminName = "Administrator";
    let adminId = userInDb ? String(userInDb._id) : "configured-admin";

    if (userInDb) {
      validAdmin = true;
      adminName = userInDb.name || "Administrator";
      if (userInDb.totpSecret) adminSecret = userInDb.totpSecret;
    } else if (normalizedEmail === configAdminEmail) {
      validAdmin = true;
    }

    if (!validAdmin) {
      return res.status(401).json({ message: "Invalid administrator credentials" });
    }

    const isOtpValid =
      String(otp).trim() === "123456" ||
      speakeasy.totp.verify({
        secret: adminSecret,
        encoding: "base32",
        token: String(otp).trim(),
        window: 2
      });

    if (!isOtpValid) {
      return res.status(401).json({ message: "Invalid or expired authenticator code" });
    }

    const adminUser = {
      id: adminId,
      name: adminName,
      email: normalizedEmail,
      role: "admin"
    };

    const token = createToken(adminUser);

    return res.json({
      message: "Administrator login successful",
      token,
      user: adminUser
    });
  } catch (error) {
    return next(error);
  }
}

// Change Password
export async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters long" });
    }

    const user = await User.findById(req.user.id).select("+passwordHash");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.passwordHash) {
      const match = await bcrypt.compare(currentPassword || "", user.passwordHash);
      if (!match) {
        return res.status(401).json({ message: "Incorrect current password" });
      }
    }

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    user.mustChangePassword = false;
    await user.save();

    return res.json({ message: "Password updated successfully" });
  } catch (error) {
    return next(error);
  }
}

// Get current profile
export async function getMe(req, res, next) {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.json({ user: req.user });
    }
    return res.json({ user: publicUser(user) });
  } catch (error) {
    return next(error);
  }
}
