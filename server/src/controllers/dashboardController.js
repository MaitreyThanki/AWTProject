import { BorrowRequest, Penalty } from "../models/index.js";

export async function getDashboard(req, res, next) {
  try {
    const scope = req.user.role === "student" ? { studentId: req.user.id } : {};
    const [pendingRequests, approvedRequests, borrowedItems, overdueItems, activePenalties] = await Promise.all([
      BorrowRequest.countDocuments({ ...scope, status: "pending" }),
      BorrowRequest.countDocuments({ ...scope, status: "approved" }),
      BorrowRequest.countDocuments({ ...scope, status: "issued" }),
      BorrowRequest.countDocuments({ ...scope, $or: [{ status: "overdue" }, { expectedReturnDate: { $lt: new Date() }, status: { $in: ["approved", "issued"] } }] }),
      Penalty.countDocuments({ ...(req.user.role === "student" ? { studentId: req.user.id } : {}), status: "pending" })
    ]);
    return res.json({ role: req.user.role, metrics: { pendingRequests, approvedRequests, borrowedItems, overdueItems, activePenalties } });
  } catch (error) { return next(error); }
}
