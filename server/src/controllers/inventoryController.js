import { InventoryItem, Lab } from "../models/index.js";

export async function listItems(_req, res, next) {
  try {
    const items = await InventoryItem.findAll({ include: Lab, order: [["name", "ASC"]] });
    res.json(items);
  } catch (error) {
    next(error);
  }
}

export async function createItem(req, res, next) {
  try {
    const item = await InventoryItem.create(req.body);
    res.status(201).json(item);
  } catch (error) {
    next(error);
  }
}

export async function updateItem(req, res, next) {
  try {
    const item = await InventoryItem.findByPk(req.params.id);
    if (!item) return res.status(404).json({ message: "Item not found" });

    await item.update(req.body);
    return res.json(item);
  } catch (error) {
    return next(error);
  }
}

