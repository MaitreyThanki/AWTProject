import { InventoryItem, Lab, ItemHistory } from "../models/index.js";

// List inventory items with filters (lab, category, search, status)
export async function listItems(req, res, next) {
  try {
    const { labId, labName, category, status, search } = req.query;
    const filter = {};

    if (labId) {
      filter.labId = labId;
    } else if (labName) {
      const lab = await Lab.findOne({ name: new RegExp(`^${labName.trim()}$`, "i") });
      if (lab) filter.labId = lab._id;
    }

    if (category) {
      filter.category = new RegExp(category.trim(), "i");
    }

    if (status) {
      filter.status = status;
    }

    if (search) {
      filter.$or = [
        { name: new RegExp(search.trim(), "i") },
        { assetCode: new RegExp(search.trim(), "i") },
        { description: new RegExp(search.trim(), "i") }
      ];
    }

    const items = await InventoryItem.find(filter)
      .populate("labId", "name facultyInchargeName facultyInchargeEmail")
      .sort({ name: 1 });

    return res.json(items);
  } catch (error) {
    return next(error);
  }
}

// Get single inventory item details
export async function getItemById(req, res, next) {
  try {
    const item = await InventoryItem.findById(req.params.id)
      .populate("labId", "name facultyInchargeName facultyInchargeEmail");
    if (!item) return res.status(404).json({ message: "Inventory item not found" });
    return res.json(item);
  } catch (error) {
    return next(error);
  }
}

// Create new inventory item (Admin or Faculty)
export async function createItem(req, res, next) {
  try {
    const {
      name,
      assetCode,
      labId,
      category,
      description,
      totalQuantity,
      availableQuantity,
      condition,
      borrowDurationDays,
      imageUrl
    } = req.body;

    if (!name || !assetCode || !labId) {
      return res.status(400).json({ message: "Item name, asset code, and lab ID are required" });
    }

    const labExists = await Lab.findById(labId);
    if (!labExists) {
      return res.status(400).json({ message: "Specified Lab does not exist" });
    }

    const existingCode = await InventoryItem.findOne({ assetCode: String(assetCode).trim() });
    if (existingCode) {
      return res.status(409).json({ message: "Asset code already exists" });
    }

    const total = Number(totalQuantity) || 0;
    const available = availableQuantity !== undefined ? Number(availableQuantity) : total;

    const item = await InventoryItem.create({
      name: name.trim(),
      assetCode: String(assetCode).trim(),
      labId,
      category: category || "General",
      description: description || "",
      totalQuantity: total,
      availableQuantity: available,
      condition: condition || "Good",
      borrowDurationDays: Number(borrowDurationDays) || 7,
      imageUrl: imageUrl || ""
    });

    // Record history
    await ItemHistory.create({
      itemId: item._id,
      action: "added",
      previousQuantity: 0,
      updatedQuantity: item.totalQuantity,
      remarks: `Item added to inventory by ${req.user.name || req.user.role}`
    });

    const populated = await item.populate("labId", "name facultyInchargeName facultyInchargeEmail");
    return res.status(201).json(populated);
  } catch (error) {
    return next(error);
  }
}

// Update inventory item
export async function updateItem(req, res, next) {
  try {
    const item = await InventoryItem.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Inventory item not found" });

    const prevQty = item.availableQuantity;
    const prevTotal = item.totalQuantity;

    Object.assign(item, req.body);

    // Ensure available does not exceed total
    if (item.availableQuantity > item.totalQuantity) {
      item.availableQuantity = item.totalQuantity;
    }

    await item.save();

    // If quantity changed, log in history
    if (prevTotal !== item.totalQuantity || prevQty !== item.availableQuantity) {
      await ItemHistory.create({
        itemId: item._id,
        action: "quantity_update",
        previousQuantity: prevQty,
        updatedQuantity: item.availableQuantity,
        remarks: `Quantity modified by ${req.user.name || req.user.role}`
      });
    }

    const populated = await item.populate("labId", "name facultyInchargeName facultyInchargeEmail");
    return res.json(populated);
  } catch (error) {
    return next(error);
  }
}

// Delete inventory item
export async function deleteItem(req, res, next) {
  try {
    const item = await InventoryItem.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: "Item not found" });

    await ItemHistory.create({
      itemId: item._id,
      action: "deleted",
      previousQuantity: item.availableQuantity,
      updatedQuantity: 0,
      remarks: `Item removed by ${req.user.name || req.user.role}`
    });

    return res.json({ message: "Inventory item deleted successfully" });
  } catch (error) {
    return next(error);
  }
}

// Get item history
export async function getItemHistory(req, res, next) {
  try {
    const history = await ItemHistory.find({ itemId: req.params.id })
      .populate("studentId", "name email enrollmentNumber")
      .populate("requestId", "purpose status expectedReturnDate")
      .sort({ createdAt: -1 });

    return res.json(history);
  } catch (error) {
    return next(error);
  }
}

// List all labs
export async function listLabs(_req, res, next) {
  try {
    const labs = await Lab.find().sort({ name: 1 });
    return res.json(labs);
  } catch (error) {
    return next(error);
  }
}
