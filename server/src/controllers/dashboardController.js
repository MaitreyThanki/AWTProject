import {
  BorrowRequest,
  InventoryItem,
  Penalty,
  Lab,
  User
} from "../models/index.js";

export async function getDashboard(req, res, next) {
  try {
    const role = req.user.role;
    const now = new Date();
    const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

    if (role === "student") {
      const studentId = req.user.id;

      const [
        activeRequests,
        approvedItems,
        dueSoon,
        activePenalties,
        penaltyRecords
      ] = await Promise.all([
        BorrowRequest.countDocuments({ studentId, status: { $in: ["pending", "approved", "issued"] } }),
        BorrowRequest.countDocuments({ studentId, status: { $in: ["approved", "issued"] } }),
        BorrowRequest.countDocuments({
          studentId,
          status: "issued",
          expectedReturnDate: { $lte: threeDaysFromNow, $gte: now }
        }),
        Penalty.countDocuments({ studentId, status: "pending" }),
        Penalty.find({ studentId, status: "pending" })
      ]);

      const penaltyTotal = penaltyRecords.reduce((sum, p) => sum + (p.amount || 0), 0);

      return res.json({
        role: "student",
        metrics: {
          activeRequests,
          approvedItems,
          dueSoon,
          activePenalties,
          penaltyTotal
        }
      });
    }

    if (role === "faculty") {
      const filter = {};
      if (req.user.assignedLabId) {
        filter.labId = req.user.assignedLabId;
      }

      const [
        pendingRequests,
        approvedRequests,
        currentlyBorrowed,
        overdueItems,
        totalLabInventory
      ] = await Promise.all([
        BorrowRequest.countDocuments({ ...filter, status: "pending" }),
        BorrowRequest.countDocuments({ ...filter, status: "approved" }),
        BorrowRequest.countDocuments({ ...filter, status: "issued" }),
        BorrowRequest.countDocuments({
          ...filter,
          status: "issued",
          expectedReturnDate: { $lt: now }
        }),
        InventoryItem.countDocuments(filter.labId ? { labId: filter.labId } : {})
      ]);

      return res.json({
        role: "faculty",
        metrics: {
          pendingRequests,
          approvedRequests,
          currentlyBorrowed,
          overdueItems,
          totalLabInventory
        }
      });
    }

    // Admin Dashboard (Doc 4.4.1)
    const [
      totalInventoryCount,
      availableInventoryResult,
      borrowedCount,
      pendingApprovals,
      overdueReturns,
      activePenalties,
      totalStudents,
      recentActivity
    ] = await Promise.all([
      InventoryItem.countDocuments(),
      InventoryItem.aggregate([
        {
          $group: {
            _id: null,
            totalAvailable: { $sum: "$availableQuantity" },
            totalStock: { $sum: "$totalQuantity" }
          }
        }
      ]),
      BorrowRequest.countDocuments({ status: "issued" }),
      BorrowRequest.countDocuments({ status: "pending" }),
      BorrowRequest.countDocuments({ status: "issued", expectedReturnDate: { $lt: now } }),
      Penalty.countDocuments({ status: "pending" }),
      User.countDocuments({ role: "student" }),
      BorrowRequest.find()
        .populate("studentId", "name email enrollmentNumber")
        .populate("labId", "name")
        .sort({ createdAt: -1 })
        .limit(5)
    ]);

    const availableItems = availableInventoryResult[0]?.totalAvailable || 0;
    const totalStock = availableInventoryResult[0]?.totalStock || 0;

    return res.json({
      role: "admin",
      metrics: {
        totalInventory: totalInventoryCount,
        totalStock,
        availableItems,
        borrowedItems: borrowedCount,
        pendingApprovals,
        overdueReturns,
        activePenalties,
        totalStudents
      },
      recentActivity
    });
  } catch (error) {
    return next(error);
  }
}
