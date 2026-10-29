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

// Visual Analytics & Lab Insights aggregation
export async function getAnalyticsData(req, res, next) {
  try {
    const [
      categoryData,
      statusData,
      topBorrowedData,
      inventoryItems,
      allRequests
    ] = await Promise.all([
      InventoryItem.aggregate([
        {
          $group: {
            _id: { $ifNull: ["$category", "General"] },
            count: { $sum: 1 },
            totalQuantity: { $sum: "$totalQuantity" },
            availableQuantity: { $sum: "$availableQuantity" }
          }
        },
        { $sort: { totalQuantity: -1 } }
      ]),
      BorrowRequest.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 }
          }
        }
      ]),
      BorrowRequest.aggregate([
        { $unwind: "$items" },
        {
          $group: {
            _id: "$items.itemName",
            borrowCount: { $sum: "$items.quantityRequested" }
          }
        },
        { $sort: { borrowCount: -1 } },
        { $limit: 7 }
      ]),
      InventoryItem.find().select("name totalQuantity availableQuantity condition status category"),
      BorrowRequest.find()
        .populate("studentId", "name enrollmentNumber")
        .populate("labId", "name")
        .sort({ createdAt: -1 })
        .limit(10)
    ]);

    // Calculate Stock Health Metrics
    let inStock = 0;
    let lowStock = 0;
    let outOfStock = 0;
    let damaged = 0;

    inventoryItems.forEach((item) => {
      if (item.condition === "Damaged" || item.status === "damaged") {
        damaged++;
      } else if (item.availableQuantity === 0) {
        outOfStock++;
      } else if (item.availableQuantity <= 5) {
        lowStock++;
      } else {
        inStock++;
      }
    });

    // Recent activity stream
    const recentEvents = allRequests.map((r) => ({
      id: r._id,
      studentName: r.studentId?.name || "Student",
      enrollment: r.studentId?.enrollmentNumber || "25BT04D...",
      itemsSummary: r.items?.map((i) => `${i.itemName} (${i.quantityRequested})`).join(", ") || "Equipment",
      status: r.status,
      timestamp: r.updatedAt || r.createdAt
    }));

    return res.json({
      categories: categoryData.map((c) => ({
        name: c._id,
        itemsCount: c.count,
        totalQuantity: c.totalQuantity,
        availableQuantity: c.availableQuantity,
        borrowedQuantity: Math.max(0, c.totalQuantity - c.availableQuantity)
      })),
      requestStatuses: statusData.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {}),
      topBorrowed: topBorrowedData.map((t) => ({
        name: t._id,
        count: t.borrowCount
      })),
      stockHealth: {
        inStock,
        lowStock,
        outOfStock,
        damaged,
        total: inventoryItems.length
      },
      recentEvents
    });
  } catch (error) {
    return next(error);
  }
}

// Student No-Dues Clearance Eligibility & Certificate Data
export async function getStudentClearance(req, res, next) {
  try {
    const studentId = req.user.id;

    const [student, activeRequests, pendingPenalties, allStudentRequests] = await Promise.all([
      User.findById(studentId).select("name email enrollmentNumber universityProgram semester division residenceType phone"),
      BorrowRequest.find({
        studentId,
        status: { $in: ["pending", "approved", "issued"] }
      }).populate("items.itemId", "name assetCode"),
      Penalty.find({
        studentId,
        status: "pending"
      }),
      BorrowRequest.find({
        studentId,
        status: "returned"
      })
    ]);

    const activeCount = activeRequests.length;
    const unpaidPenaltyTotal = pendingPenalties.reduce((sum, p) => sum + (p.amount || 0), 0);
    const eligible = activeCount === 0 && unpaidPenaltyTotal === 0;

    const clearanceRef = `GSFCU-ND-${new Date().getFullYear()}-${String(studentId).slice(-6).toUpperCase()}`;

    return res.json({
      eligible,
      student,
      clearanceRef,
      generatedDate: new Date(),
      activeCount,
      unpaidPenaltyTotal,
      activeBorrowings: activeRequests.map((r) => ({
        id: r._id,
        status: r.status,
        expectedReturnDate: r.expectedReturnDate,
        items: r.items?.map((i) => `${i.itemName} (Qty: ${i.quantityRequested})`).join(", ")
      })),
      unpaidPenalties: pendingPenalties.map((p) => ({
        id: p._id,
        reason: p.reason,
        amount: p.amount,
        date: p.createdAt
      })),
      totalReturnedCount: allStudentRequests.length
    });
  } catch (error) {
    return next(error);
  }
}

