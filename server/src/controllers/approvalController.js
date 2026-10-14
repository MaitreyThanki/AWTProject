import mongoose from "mongoose";
import { BorrowRequest, InventoryItem, ItemHistory } from "../models/index.js";

export async function decideRequest(req, res, next) {
  const reserved = [];
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid request id" });
    const { decision, remarks, expectedReturnDate } = req.body;
    if (!["approved", "rejected"].includes(decision)) return res.status(400).json({ message: "Decision must be approved or rejected" });

    const request = await BorrowRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: "Request not found" });
    if (request.status !== "pending") return res.status(409).json({ message: "Only pending requests can be decided" });

    if (decision === "approved") {
      for (const row of request.items) {
        const item = await InventoryItem.findOneAndUpdate(
          { _id: row.itemId, availableQuantity: { $gte: row.quantityRequested }, status: { $ne: "damaged" } },
          { $inc: { availableQuantity: -row.quantityRequested } },
          { new: true }
        );
        if (!item) {
          for (const previous of [...reserved].reverse()) await InventoryItem.updateOne({ _id: previous.itemId }, { $inc: { availableQuantity: previous.quantity } });
          return res.status(409).json({ message: `Insufficient stock for ${row.itemName}` });
        }
        reserved.push({ itemId: row.itemId, quantity: row.quantityRequested });
        await ItemHistory.create({ itemId: row.itemId, requestId: request._id, studentId: request.studentId, action: "approved_reservation", previousQuantity: item.availableQuantity + row.quantityRequested, updatedQuantity: item.availableQuantity, remarks: remarks || "" });
      }
    }

    request.status = decision;
    request.facultyRemarks = remarks || "";
    if (expectedReturnDate) request.expectedReturnDate = expectedReturnDate;
    request.approvals.push({ facultyId: req.user.id, decision, remarks, decisionDate: new Date() });
    await request.save();
    return res.json({ ...request.toObject(), id: String(request._id), BorrowRequestItems: request.items });
  } catch (error) {
    for (const previous of [...reserved].reverse()) {
      await InventoryItem.updateOne({ _id: previous.itemId }, { $inc: { availableQuantity: previous.quantity } }).catch(() => {});
    }
    return next(error);
  }
}
