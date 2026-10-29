import path from "path";
import fs from "fs";
import { Document, BorrowRequest } from "../models/index.js";

// Upload document for existing request
export async function uploadDocument(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No document file uploaded" });
    }

    const { requestId } = req.params;
    const request = await BorrowRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: "Borrow request not found" });
    }

    // Verify ownership
    if (req.user.role === "student" && String(request.studentId) !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to upload documents for this request" });
    }

    const docRecord = {
      uploadedBy: req.user.id,
      fileName: req.file.originalname,
      filePath: req.file.path,
      fileType: req.file.mimetype,
      uploadDate: new Date()
    };

    // Save embedded in request
    request.documents.push(docRecord);
    await request.save();

    // Also save in Document collection for audit
    const standaloneDoc = await Document.create({
      requestId: request._id,
      uploadedBy: req.user.id,
      fileName: req.file.originalname,
      filePath: req.file.path,
      fileType: req.file.mimetype
    });

    return res.status(201).json({
      message: "Document uploaded successfully",
      document: standaloneDoc
    });
  } catch (error) {
    return next(error);
  }
}

// List all documents (Admin review - Doc 4.4.4)
export async function listDocuments(req, res, next) {
  try {
    const { requestId } = req.query;
    const filter = {};
    if (requestId) filter.requestId = requestId;

    const documents = await Document.find(filter)
      .populate("uploadedBy", "name email role enrollmentNumber")
      .populate("requestId", "purpose status expectedReturnDate")
      .sort({ createdAt: -1 });

    return res.json(documents);
  } catch (error) {
    return next(error);
  }
}

// Secure download/preview of document file
export async function getDocumentFile(req, res, next) {
  try {
    const doc = await Document.findById(req.params.id)
      .populate("requestId");

    if (!doc) {
      return res.status(404).json({ message: "Document not found" });
    }

    // Permission check
    if (req.user.role === "student") {
      const studentId = doc.requestId?.studentId;
      if (String(studentId) !== req.user.id && String(doc.uploadedBy) !== req.user.id) {
        return res.status(403).json({ message: "Access denied to this document" });
      }
    }

    const absolutePath = path.resolve(doc.filePath);
    if (!fs.existsSync(absolutePath)) {
      return res.status(404).json({ message: "File not found on server disk" });
    }

    res.setHeader("Content-Disposition", `inline; filename="${doc.fileName}"`);
    res.setHeader("Content-Type", doc.fileType || "application/octet-stream");
    return res.sendFile(absolutePath);
  } catch (error) {
    return next(error);
  }
}
