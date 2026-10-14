import mongoose from "mongoose";
import { Document, BorrowRequest } from "../models/index.js";

export async function uploadDocument(req, res, next) {
  try {
    if (!mongoose.isValidObjectId(req.params.requestId)) return res.status(400).json({ message: "Invalid request id" });
    if (!req.file) return res.status(400).json({ message: "Please attach a document" });
    const request = await BorrowRequest.findById(req.params.requestId);
    if (!request) return res.status(404).json({ message: "Request not found" });
    if (req.user.role === "student" && String(request.studentId) !== String(req.user.id)) {
      return res.status(403).json({ message: "You can only upload documents to your own request" });
    }
    const document = await Document.create({
      requestId: request._id,
      uploadedBy: req.user.id,
      fileName: req.file.originalname,
      filePath: req.file.path,
      fileType: req.file.mimetype
    });
    return res.status(201).json({ ...document.toObject(), id: String(document._id) });
  } catch (error) { return next(error); }
}
