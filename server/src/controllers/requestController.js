import mongoose from "mongoose";
import { BorrowRequest, InventoryItem } from "../models/index.js";

export async function createBorrowRequest(req, res, next) {
  try {
    const { items = [], BorrowRequestItems, ...requestData } = req.body;
    const submittedItems = items.length ? items : (BorrowRequestItems || []);
    if (!Array.isArray(submittedItems) || submittedItems.length === 0) return res.status(400).json({ message: "Add at least one item to the request" });
    const normalized = [];
    for (const row of submittedItems) {
      const itemId = row.itemId || row.InventoryItemId || row._id;
      const quantityRequested = Number(row.quantityRequested ?? row.quantity ?? 1);
      if (!mongoose.isValidObjectId(itemId) || !Number.isInteger(quantityRequested) || quantityRequested < 1) {
        return res.status(400).json({ message: "Each requested item needs a valid itemId and positive integer quantity" });
      }
      const inventory = await InventoryItem.findById(itemId).lean();
      if (!inventory) return res.status(400).json({ message: `Inventory item not found: ${itemId}` });
      normalized.push({ itemId: inventory._id, itemName: inventory.name, quantityRequested, quantityIssued: 0, returnStatus: "pending" });
    }
    const request = await BorrowRequest.create({ ...requestData, studentId: req.user.id, items: normalized, status: "pending" });
    return res.status(201).json({ ...request.toObject(), id: String(request._id), BorrowRequestItems: request.items });
  } catch (error) { return next(error); }
}

export async function listRequests(req, res, next) {
  try {
    const filter = req.user.role === "student" ? { studentId: req.user.id } : {};
    const requests = await BorrowRequest.find(filter).populate("studentId", "name email enrollmentNumber").sort({ createdAt: -1 }).lean();
    return res.json(requests.map(request => ({
      ...request,
      id: String(request._id),
      student: request.studentId,
      studentId: request.studentId?._id || request.studentId,
      BorrowRequestItems: (request.items || []).map(item => ({ ...item, id: String(item._id), InventoryItemId: item.itemId, InventoryItem: { _id: item.itemId, id: String(item.itemId), name: item.itemName } }))
    })));
  } catch (error) { return next(error); }
}
