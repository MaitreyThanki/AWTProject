import jwt from "jsonwebtoken";

export function authenticateToken(req, res, next) {
  const header = req.headers.authorization;

  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Authentication required",
    });
  }

  const token = header.slice(7);

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET, {
      issuer: "inventory-management",
      audience: "inventory-management-api",
    });

    next();
  } catch {
    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }
}

export function requireAdmin(req, res, next) {
  if (req.user?.role !== "admin") {
    return res.status(403).json({
      message: "Admin access required",
    });
  }

  next();
}