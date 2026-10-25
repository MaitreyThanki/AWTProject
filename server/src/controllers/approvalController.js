import { BorrowRequest, OverrideLog, Penalty } from "../models/index.js";
import { sendEmail } from "../services/emailService.js";

// Faculty Decision (Approve or Reject)
export async function decideRequest(req, res, next) {
  try {
    const { decision, remarks, expectedReturnDate } = req.body;

    if (!["approved", "rejected"].includes(decision)) {
      return res.status(400).json({ message: "Decision must be 'approved' or 'rejected'" });
    }

    const request = await BorrowRequest.findById(req.params.id)
      .populate("studentId", "name email");

    if (!request) return res.status(404).json({ message: "Borrow request not found" });

    // Faculty lab verification if assigned
    if (req.user.role === "faculty" && req.user.assignedLabId) {
      if (request.labId && String(request.labId) !== String(req.user.assignedLabId)) {
        return res.status(403).json({
          message: "You can only approve or reject requests for your assigned lab"
        });
      }
    }

    request.status = decision;
    request.facultyRemarks = remarks || "";
    if (expectedReturnDate) {
      request.expectedReturnDate = new Date(expectedReturnDate);
    }

    request.approvals.push({
      facultyId: req.user.id,
      decision,
      remarks: remarks || "",
      decisionDate: new Date()
    });

    await request.save();

    // Notify student via email
    if (request.studentId?.email) {
      try {
        await sendEmail({
          to: request.studentId.email,
          subject: `Lab Request Update: Request #${request._id} has been ${decision}`,
          text: `Dear ${request.studentId.name},\n\nYour borrow request #${request._id} has been ${decision.toUpperCase()}.\nRemarks: ${remarks || "None"}\n\nExpected Return Date: ${request.expectedReturnDate ? new Date(request.expectedReturnDate).toLocaleDateString() : "N/A"}\n\nRegards,\nLab In-Charge`
        });
      } catch (err) {
        console.warn("Email notice could not be sent:", err.message);
      }
    }

    return res.json({
      message: `Request has been ${decision}`,
      request
    });
  } catch (error) {
    return next(error);
  }
}

// Admin Override Decision (Doc 4.4.6)
export async function overrideDecision(req, res, next) {
  try {
    const { updatedStatus, reason, extendReturnDate } = req.body;

    if (!updatedStatus || !reason) {
      return res.status(400).json({
        message: "Updated status and an override reason are mandatory for all administrative overrides"
      });
    }

    const request = await BorrowRequest.findById(req.params.id)
      .populate("studentId", "name email");

    if (!request) return res.status(404).json({ message: "Borrow request not found" });

    const previousStatus = request.status;
    request.status = updatedStatus;
    request.adminRemarks = reason;

    if (extendReturnDate) {
      request.expectedReturnDate = new Date(extendReturnDate);
    }

    await request.save();

    // Mandatory override log record (Section 4.4.6 & 8.7)
    const log = await OverrideLog.create({
      requestId: request._id,
      adminId: req.user.id,
      adminName: req.user.name || "Administrator",
      previousStatus,
      updatedStatus,
      reason: reason.trim(),
      overrideDate: new Date()
    });

    return res.json({
      message: `Admin override applied: status changed from '${previousStatus}' to '${updatedStatus}'`,
      request,
      overrideLog: log
    });
  } catch (error) {
    return next(error);
  }
}

// List all administrative override logs
export async function listOverrideLogs(req, res, next) {
  try {
    const logs = await OverrideLog.find()
      .populate("requestId", "purpose status studentId expectedReturnDate")
      .populate("adminId", "name email")
      .sort({ overrideDate: -1 });

    return res.json(logs);
  } catch (error) {
    return next(error);
  }
}
