import mongoose from "mongoose";

const { Schema, model, models } = mongoose;
const objectId = Schema.Types.ObjectId;

const userSchema = new Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
  passwordHash: { type: String, required: true, select: false },
  role: { type: String, enum: ["student", "faculty", "admin"], required: true, index: true },
  phone: String,
  enrollmentNumber: String,
  universityProgram: String,
  semester: String,
  division: String,
  residenceType: { type: String, enum: ["home", "hostel"] }
}, { timestamps: true });

const labSchema = new Schema({
  name: { type: String, required: true, unique: true, trim: true },
  facultyInchargeName: String,
  facultyInchargeEmail: String
}, { timestamps: true });

const inventoryItemSchema = new Schema({
  name: { type: String, required: true, trim: true },
  assetCode: { type: String, required: true, unique: true, trim: true },
  category: String,
  description: String,
  totalQuantity: { type: Number, required: true, min: 0, default: 0 },
  availableQuantity: { type: Number, required: true, min: 0, default: 0 },
  condition: String,
  status: { type: String, enum: ["available", "unavailable", "damaged"], default: "available" },
  borrowDurationDays: { type: Number, min: 1, default: 7 },
  imageUrl: String,
  labId: { type: objectId, ref: "Lab", index: true }
}, { timestamps: true });

const requestItemSchema = new Schema({
  itemId: { type: objectId, ref: "InventoryItem", required: true },
  itemName: { type: String, required: true },
  quantityRequested: { type: Number, required: true, min: 1 },
  quantityIssued: { type: Number, min: 0, default: 0 },
  returnStatus: { type: String, enum: ["pending", "issued", "returned", "damaged", "lost"], default: "pending" }
}, { _id: true });

const approvalHistorySchema = new Schema({
  facultyId: { type: objectId, ref: "User", required: true },
  decision: { type: String, enum: ["approved", "rejected"], required: true },
  remarks: String,
  decisionDate: { type: Date, default: Date.now }
}, { _id: true });

const borrowRequestSchema = new Schema({
  studentId: { type: objectId, ref: "User", required: true, index: true },
  items: { type: [requestItemSchema], validate: v => v.length > 0 },
  expectedBorrowDate: Date,
  expectedReturnDate: Date,
  actualReturnDate: Date,
  purpose: String,
  status: { type: String, enum: ["pending", "approved", "rejected", "issued", "returned", "overdue", "cancelled"], default: "pending", index: true },
  facultyRemarks: String,
  adminRemarks: String,
  approvals: { type: [approvalHistorySchema], default: [] }
}, { timestamps: true });

const overrideLogSchema = new Schema({
  requestId: { type: objectId, ref: "BorrowRequest", required: true, index: true },
  adminId: { type: objectId, ref: "User", required: true },
  previousStatus: String,
  updatedStatus: String,
  reason: { type: String, required: true },
  overrideDate: { type: Date, default: Date.now }
}, { timestamps: true });

const penaltySchema = new Schema({
  requestId: { type: objectId, ref: "BorrowRequest", required: true, index: true },
  studentId: { type: objectId, ref: "User", required: true, index: true },
  itemId: { type: objectId, ref: "InventoryItem" },
  reason: { type: String, required: true },
  amount: { type: Number, min: 0, default: 0 },
  status: { type: String, enum: ["pending", "paid", "waived"], default: "pending" },
  remarks: String
}, { timestamps: true });

const itemHistorySchema = new Schema({
  itemId: { type: objectId, ref: "InventoryItem", required: true, index: true },
  requestId: { type: objectId, ref: "BorrowRequest" },
  studentId: { type: objectId, ref: "User" },
  action: { type: String, required: true },
  previousQuantity: Number,
  updatedQuantity: Number,
  remarks: String
}, { timestamps: true });

const documentSchema = new Schema({
  requestId: { type: objectId, ref: "BorrowRequest", required: true, index: true },
  uploadedBy: { type: objectId, ref: "User", required: true },
  fileName: { type: String, required: true },
  filePath: { type: String, required: true },
  fileType: String
}, { timestamps: true });

export const User = models.User || model("User", userSchema);
export const Lab = models.Lab || model("Lab", labSchema);
export const InventoryItem = models.InventoryItem || model("InventoryItem", inventoryItemSchema);
export const BorrowRequest = models.BorrowRequest || model("BorrowRequest", borrowRequestSchema);
export const OverrideLog = models.OverrideLog || model("OverrideLog", overrideLogSchema);
export const Penalty = models.Penalty || model("Penalty", penaltySchema);
export const ItemHistory = models.ItemHistory || model("ItemHistory", itemHistorySchema);
export const Document = models.Document || model("Document", documentSchema);
