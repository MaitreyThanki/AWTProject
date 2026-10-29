import {
  BorrowRequest,
  InventoryItem,
  ItemHistory,
  Penalty,
  Lab,
  User
} from "../models/index.js";
import { sendEmail } from "../services/emailService.js";

// Create a new borrow request (Student)
export async function createBorrowRequest(req, res, next) {
  try {
    let { items, expectedBorrowDate, expectedReturnDate, purpose, labId } = req.body;

    // Handle parsed JSON if sent as multipart string
    if (typeof items === "string") {
      try {
        items = JSON.parse(items);
      } catch (e) {
        return res.status(400).json({ message: "Invalid items JSON format" });
      }
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "At least one item must be requested" });
    }

    // Verify availability for all items
    const requestItems = [];
    let inferredLabId = labId;

    for (const reqItem of items) {
      const inventoryItem = await InventoryItem.findById(reqItem.itemId);
      if (!inventoryItem) {
        return res.status(404).json({ message: `Item not found: ${reqItem.itemId}` });
      }

      const qty = Number(reqItem.quantityRequested) || 1;
      if (inventoryItem.availableQuantity < qty) {
        return res.status(400).json({
          message: `Insufficient stock for "${inventoryItem.name}". Available: ${inventoryItem.availableQuantity}, Requested: ${qty}`
        });
      }

      if (!inferredLabId && inventoryItem.labId) {
        inferredLabId = inventoryItem.labId;
      }

      requestItems.push({
        itemId: inventoryItem._id,
        itemName: inventoryItem.name,
        quantityRequested: qty,
        quantityIssued: 0,
        returnStatus: "pending"
      });
    }

    // Documents uploaded with this request
    const embeddedDocs = [];
    if (req.files && Array.isArray(req.files)) {
      for (const file of req.files) {
        embeddedDocs.push({
          uploadedBy: req.user.id,
          fileName: file.originalname,
          filePath: file.path,
          fileType: file.mimetype,
          uploadDate: new Date()
        });
      }
    }

    const borrowRequest = await BorrowRequest.create({
      studentId: req.user.id,
      labId: inferredLabId,
      items: requestItems,
      documents: embeddedDocs,
      expectedBorrowDate: expectedBorrowDate ? new Date(expectedBorrowDate) : new Date(),
      expectedReturnDate: expectedReturnDate
        ? new Date(expectedReturnDate)
        : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      purpose: purpose || "",
      status: "pending"
    });

    const populated = await borrowRequest.populate([
      { path: "studentId", select: "name email phone enrollmentNumber universityProgram" },
      { path: "labId", select: "name facultyInchargeName facultyInchargeEmail" },
      { path: "items.itemId", select: "name assetCode category condition imageUrl" }
    ]);

    return res.status(201).json(populated);
  } catch (error) {
    return next(error);
  }
}

// List borrow requests with role-based visibility and filters
export async function listRequests(req, res, next) {
  try {
    const { status, labId, studentId } = req.query;
    const filter = {};

    if (req.user.role === "student") {
      filter.studentId = req.user.id;
    } else if (req.user.role === "faculty") {
      // If faculty is assigned to a specific lab, filter by default or allow query
      if (req.user.assignedLabId) {
        filter.labId = req.user.assignedLabId;
      } else if (labId) {
        filter.labId = labId;
      }
    } else if (req.user.role === "admin") {
      if (labId) filter.labId = labId;
      if (studentId) filter.studentId = studentId;
    }

    if (status) {
      filter.status = status;
    }

    const requests = await BorrowRequest.find(filter)
      .populate("studentId", "name email phone enrollmentNumber universityProgram semester division residenceType")
      .populate("labId", "name facultyInchargeName facultyInchargeEmail")
      .populate("items.itemId", "name assetCode category condition")
      .sort({ createdAt: -1 });

    return res.json(requests);
  } catch (error) {
    return next(error);
  }
}

// Get single request detail (Supports full ObjectId, #GP-XXXX suffix, and student enrollment number)
export async function getRequestById(req, res, next) {
  try {
    let raw = String(req.params.id || "").trim();
    if (raw.includes("AWT-PASS:")) {
      raw = raw.split("AWT-PASS:")[1].trim();
    }
    raw = raw.replace(/^#?GP-/, "").trim();

    let request = null;

    // 1. Try direct ObjectId match if valid 24 hex characters
    if (/^[0-9a-fA-F]{24}$/.test(raw)) {
      request = await BorrowRequest.findById(raw)
        .populate("studentId", "name email phone enrollmentNumber universityProgram semester division residenceType")
        .populate("labId", "name facultyInchargeName facultyInchargeEmail")
        .populate("items.itemId", "name assetCode category condition availableQuantity totalQuantity")
        .populate("approvals.facultyId", "name email role");
    }

    // 2. If not found or raw is a short code / enrollment number, search recent requests
    if (!request) {
      const candidates = await BorrowRequest.find()
        .populate("studentId", "name email phone enrollmentNumber universityProgram semester division residenceType")
        .populate("labId", "name facultyInchargeName facultyInchargeEmail")
        .populate("items.itemId", "name assetCode category condition availableQuantity totalQuantity")
        .populate("approvals.facultyId", "name email role")
        .sort({ createdAt: -1 })
        .limit(100);

      const target = raw.toLowerCase();
      request = candidates.find((r) => {
        const fullId = String(r._id).toLowerCase();
        const short8 = fullId.slice(-8);
        const short6 = fullId.slice(-6);
        const roll = (r.studentId?.enrollmentNumber || "").toLowerCase();
        return fullId === target || short8 === target || short6 === target || roll === target;
      });
    }

    if (!request) {
      return res.status(404).json({ message: `No requisition found for reference "${raw}"` });
    }

    // Students can only see their own requests
    if (req.user.role === "student" && String(request.studentId?._id || request.studentId) !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized access to request" });
    }

    return res.json(request);
  } catch (error) {
    return next(error);
  }
}


// Issue items to student (Stock Decrement)
export async function issueItems(req, res, next) {
  try {
    const request = await BorrowRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: "Request not found" });

    if (request.status !== "approved") {
      return res.status(400).json({
        message: `Request must be in 'approved' status before issuing items. Current status: ${request.status}`
      });
    }

    // Decrement stock for each item
    for (const item of request.items) {
      const invItem = await InventoryItem.findById(item.itemId);
      if (!invItem) continue;

      const qty = item.quantityRequested;
      item.quantityIssued = qty;
      item.returnStatus = "issued";

      const prevQty = invItem.availableQuantity;
      invItem.availableQuantity = Math.max(0, invItem.availableQuantity - qty);
      await invItem.save();

      // Log in ItemHistory
      await ItemHistory.create({
        itemId: invItem._id,
        requestId: request._id,
        studentId: request.studentId,
        action: "borrow",
        previousQuantity: prevQty,
        updatedQuantity: invItem.availableQuantity,
        remarks: `Issued ${qty} unit(s) to student for Request #${request._id}`
      });
    }

    request.status = "issued";
    await request.save();

    const populated = await request.populate([
      { path: "studentId", select: "name email phone enrollmentNumber" },
      { path: "items.itemId", select: "name assetCode availableQuantity" }
    ]);

    return res.json({
      message: "Items issued successfully and inventory updated",
      request: populated
    });
  } catch (error) {
    return next(error);
  }
}

// Return items from student (Stock Increment & Penalty calculation)
export async function returnItems(req, res, next) {
  try {
    const { conditionNotes, isDamaged, isLost, damageCost, penaltyRemarks } = req.body;
    const request = await BorrowRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: "Request not found" });

    if (!["issued", "overdue"].includes(request.status)) {
      return res.status(400).json({
        message: `Cannot return items for request in '${request.status}' status`
      });
    }

    const returnDate = new Date();
    request.actualReturnDate = returnDate;
    request.status = "returned";

    let penaltyAmount = 0;
    let penaltyReasons = [];

    // Check overdue
    if (request.expectedReturnDate && returnDate > new Date(request.expectedReturnDate)) {
      const msDiff = returnDate.getTime() - new Date(request.expectedReturnDate).getTime();
      const daysOverdue = Math.ceil(msDiff / (1000 * 60 * 60 * 24));
      const dailyRate = 50; // 50 currency units per day
      const overdueFee = daysOverdue * dailyRate;
      penaltyAmount += overdueFee;
      penaltyReasons.push(`Late return by ${daysOverdue} day(s) (₹${overdueFee})`);
    }

    if (isDamaged) {
      const damageFee = Number(damageCost) || 200;
      penaltyAmount += damageFee;
      penaltyReasons.push(`Damaged item: ${conditionNotes || "Repair required"} (₹${damageFee})`);
    }

    if (isLost) {
      const lostFee = Number(damageCost) || 500;
      penaltyAmount += lostFee;
      penaltyReasons.push(`Lost item compensation (₹${lostFee})`);
    }

    // Restore stock for items
    for (const item of request.items) {
      item.returnStatus = isLost ? "lost" : isDamaged ? "damaged" : "returned";

      if (!isLost) {
        const invItem = await InventoryItem.findById(item.itemId);
        if (invItem) {
          const prevQty = invItem.availableQuantity;
          const returnQty = item.quantityIssued || item.quantityRequested;

          invItem.availableQuantity = Math.min(invItem.totalQuantity, invItem.availableQuantity + returnQty);
          if (isDamaged) {
            invItem.condition = "Damaged";
          }
          await invItem.save();

          await ItemHistory.create({
            itemId: invItem._id,
            requestId: request._id,
            studentId: request.studentId,
            action: isDamaged ? "damaged_return" : "return",
            previousQuantity: prevQty,
            updatedQuantity: invItem.availableQuantity,
            remarks: `Returned ${returnQty} unit(s). Status: ${item.returnStatus}`
          });
        }
      }
    }

    await request.save();

    // Create penalty record if any violation
    let penaltyRecord = null;
    if (penaltyAmount > 0) {
      penaltyRecord = await Penalty.create({
        requestId: request._id,
        studentId: request.studentId,
        itemId: request.items[0]?.itemId,
        reason: penaltyReasons.join("; "),
        amount: penaltyAmount,
        status: "pending",
        remarks: penaltyRemarks || conditionNotes || ""
      });
    }

    return res.json({
      message: "Items returned successfully and inventory updated",
      request,
      penalty: penaltyRecord
    });
  } catch (error) {
    return next(error);
  }
}

// Cancel request (Student or Admin)
export async function cancelRequest(req, res, next) {
  try {
    const request = await BorrowRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: "Request not found" });

    if (!["pending", "approved"].includes(request.status)) {
      return res.status(400).json({
        message: `Cannot cancel a request with status: ${request.status}`
      });
    }

    request.status = "cancelled";
    await request.save();

    return res.json({ message: "Request cancelled successfully", request });
  } catch (error) {
    return next(error);
  }
}
