import { Penalty, User } from "../models/index.js";

// List penalties (Student sees own, Admin/Faculty see all)
export async function listPenalties(req, res, next) {
  try {
    const filter = {};
    if (req.user.role === "student") {
      filter.studentId = req.user.id;
    } else if (req.query.studentId) {
      filter.studentId = req.query.studentId;
    }

    if (req.query.status) {
      filter.status = req.query.status;
    }

    const penalties = await Penalty.find(filter)
      .populate("studentId", "name email phone enrollmentNumber")
      .populate("itemId", "name assetCode")
      .populate("requestId", "purpose status expectedReturnDate actualReturnDate")
      .sort({ createdAt: -1 });

    return res.json(penalties);
  } catch (error) {
    return next(error);
  }
}

// Create penalty manually (Admin or Faculty)
export async function createPenalty(req, res, next) {
  try {
    const { requestId, studentId, itemId, reason, amount, remarks } = req.body;

    if (!studentId || !reason || amount === undefined) {
      return res.status(400).json({ message: "Student ID, reason, and penalty amount are required" });
    }

    const penalty = await Penalty.create({
      requestId: requestId || undefined,
      studentId,
      itemId: itemId || undefined,
      reason: reason.trim(),
      amount: Number(amount),
      status: "pending",
      remarks: remarks || ""
    });

    const populated = await penalty.populate([
      { path: "studentId", select: "name email enrollmentNumber" },
      { path: "itemId", select: "name assetCode" }
    ]);

    return res.status(201).json(populated);
  } catch (error) {
    return next(error);
  }
}

// Update penalty status (Paid or Waived)
export async function updatePenaltyStatus(req, res, next) {
  try {
    const { status, remarks } = req.body;
    if (!["pending", "paid", "waived"].includes(status)) {
      return res.status(400).json({ message: "Status must be 'pending', 'paid', or 'waived'" });
    }

    const penalty = await Penalty.findById(req.params.id);
    if (!penalty) return res.status(404).json({ message: "Penalty record not found" });

    // Only admin can waive a penalty
    if (status === "waived" && req.user.role !== "admin") {
      return res.status(403).json({ message: "Only administrators can waive penalties" });
    }

    penalty.status = status;
    if (remarks) penalty.remarks = remarks;
    await penalty.save();

    return res.json({
      message: `Penalty marked as ${status}`,
      penalty
    });
  } catch (error) {
    return next(error);
  }
}
