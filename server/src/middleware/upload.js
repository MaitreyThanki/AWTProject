import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const here = path.dirname(fileURLToPath(import.meta.url));
const uploadDirectory = path.resolve(here, "../../uploads");
fs.mkdirSync(uploadDirectory, { recursive: true });
const allowedTypes = new Set([".pdf", ".jpg", ".jpeg", ".png"]);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDirectory),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  }
});

export const upload = multer({
  storage,
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowedTypes.has(ext)) return cb(new Error("Only PDF, JPG and PNG documents are allowed"));
    return cb(null, true);
  },
  limits: { fileSize: 5 * 1024 * 1024 }
});
