import { Document } from "../models/index.js";

export async function uploadDocument(req, res, next) {
  try {
    const document = await Document.create({
      BorrowRequestId: req.params.requestId,
      uploadedBy: req.user.role,
      fileName: req.file.originalname,
      filePath: req.file.path,
      fileType: req.file.mimetype
    });

    res.status(201).json(document);
  } catch (error) {
    next(error);
  }
}

