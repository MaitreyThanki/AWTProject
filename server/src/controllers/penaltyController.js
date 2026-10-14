import mongoose from "mongoose";
import { Penalty, BorrowRequest, User } from "../models/index.js";

export async function listPenalties(req, res, next) {
  try {
    const filter = req.user.role === "student" ? { studentId: req.user.id } : {};
    const penalties = await Penalty.find(filter).populate("studentId", "name email").populate("itemId", "name assetCode").sort({ createdAt: -1 }).lean();
    return res.json(penalties.map(p => ({ ...p, id: String(p._id), student: p.studentId })));
  } catch (error) { return next(error); }
}

export async function createPenalty(req, res, next) {
  try {
    const { requestId, studentId, itemId, reason, amount, status, remarks } = req.body;
    if (!mongoose.isValidObjectId(requestId) || !reason) return res.status(400).json({ message: "Valid requestId and reason are required" });
    const request = await BorrowRequest.findById(requestId).lean();
    if (!request) return res.status(404).json({ message: "Request not found" });
    const targetStudentId = studentId || request.studentId;
    if (!mongoose.isValidObjectId(targetStudentId) || !(await User.exists({ _id: targetStudentId }))) return res.status(400).json({ message: "Valid studentId is required" });
    const penalty = await Penalty.create({ requestId, studentId: targetStudentId, itemId: itemId || request.items[0]?.itemId, reason, amount: Number(amount || 0), status, remarks });
    return res.status(201).json({ ...penalty.toObject(), id: String(penalty._id) });
  } catch (error) { return next(error); }
}
