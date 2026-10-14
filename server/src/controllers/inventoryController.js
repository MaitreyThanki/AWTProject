import mongoose from "mongoose";
import { InventoryItem, Lab, ItemHistory } from "../models/index.js";

export async function listItems(_req, res, next) {
  try {
    const items = await InventoryItem.find().populate("labId").sort({ name: 1 }).lean();
    return res.json(items.map(item => ({ ...item, id: String(item._id), Lab: item.labId, lab: item.labId })));
  } catch (error) { return next(error); }
}

export async function createItem(req, res, next) {
  try {
    const data = { ...req.body };
    if (data.LabId && !data.labId) data.labId = data.LabId;
    delete data.LabId;
    if (data.labId && !mongoose.isValidObjectId(data.labId)) return res.status(400).json({ message: "Invalid labId" });
    const item = await InventoryItem.create(data);
    if (item.availableQuantity > 0) item.status = "available";
    await item.save();
    return res.status(201).json({ ...item.toObject(), id: String(item._id) });
  } catch (error) { return next(error); }
}

export async function updateItem(req, res, next) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid item id" });
    const data = { ...req.body };
    if (data.LabId && !data.labId) data.labId = data.LabId;
    delete data.LabId;
    const item = await InventoryItem.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true }).populate("labId");
    if (!item) return res.status(404).json({ message: "Item not found" });
    return res.json({ ...item.toObject(), id: String(item._id), Lab: item.labId });
  } catch (error) { return next(error); }
}
