import mongoose from "mongoose";

const { Schema, model, models } = mongoose;
const objectId = Schema.Types.ObjectId;

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },
    passwordHash: { type: String, select: false },
    role: {
      type: String,
      enum: ["student", "faculty", "admin"],
      required: true,
      index: true
    },
    phone: { type: String, trim: true },
    enrollmentNumber: { type: String, trim: true },
    universityProgram: { type: String, trim: true },
    semester: { type: String, trim: true },
    division: { type: String, trim: true },
    residenceType: { type: String, enum: ["home", "hostel"], default: "home" },
    assignedLabId: { type: objectId, ref: "Lab" },
    totpSecret: { type: String, select: false },
    mustChangePassword: { type: Boolean, default: false }
  },
  { timestamps: true }
);

const labSchema = new Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    facultyInchargeName: { type: String, trim: true },
    facultyInchargeEmail: { type: String, trim: true, lowercase: true }
  },
  { timestamps: true }
);

const inventoryItemSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    assetCode: { type: String, required: true, unique: true, trim: true, index: true },
    category: { type: String, trim: true, index: true },
    description: { type: String, trim: true },
    totalQuantity: { type: Number, required: true, min: 0, default: 0 },
    availableQuantity: { type: Number, required: true, min: 0, default: 0 },
    condition: { type: String, default: "Good" },
    status: {
      type: String,
      enum: ["available", "unavailable", "damaged"],
      default: "available",
      index: true
    },
    borrowDurationDays: { type: Number, min: 1, default: 7 },
    imageUrl: { type: String, default: "" },
    labId: { type: objectId, ref: "Lab", required: true, index: true }
  },
  { timestamps: true }
);

const requestItemSchema = new Schema(
  {
    itemId: { type: objectId, ref: "InventoryItem", required: true },
    itemName: { type: String, required: true },
    quantityRequested: { type: Number, required: true, min: 1 },
    quantityIssued: { type: Number, min: 0, default: 0 },
    returnStatus: {
      type: String,
      enum: ["pending", "issued", "returned", "damaged", "lost"],
      default: "pending"
    }
  },
  { _id: true }
);

const embeddedDocumentSchema = new Schema(
  {
    uploadedBy: { type: objectId, ref: "User" },
    fileName: { type: String, required: true },
    filePath: { type: String, required: true },
    fileType: { type: String },
    uploadDate: { type: Date, default: Date.now }
  },
  { _id: true }
);

const approvalHistorySchema = new Schema(
  {
    facultyId: { type: objectId, ref: "User", required: true },
    decision: { type: String, enum: ["approved", "rejected"], required: true },
    remarks: { type: String, default: "" },
    decisionDate: { type: Date, default: Date.now }
  },
  { _id: true }
);

const borrowRequestSchema = new Schema(
  {
    studentId: { type: objectId, ref: "User", required: true, index: true },
    labId: { type: objectId, ref: "Lab", index: true },
    items: {
      type: [requestItemSchema],
      validate: (v) => Array.isArray(v) && v.length > 0
    },
    documents: { type: [embeddedDocumentSchema], default: [] },
    expectedBorrowDate: { type: Date },
    expectedReturnDate: { type: Date },
    actualReturnDate: { type: Date },
    purpose: { type: String, default: "" },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "issued", "returned", "overdue", "cancelled"],
      default: "pending",
      index: true
    },
    facultyRemarks: { type: String, default: "" },
    adminRemarks: { type: String, default: "" },
    approvals: { type: [approvalHistorySchema], default: [] }
  },
  { timestamps: true }
);

const overrideLogSchema = new Schema(
  {
    requestId: { type: objectId, ref: "BorrowRequest", required: true, index: true },
    adminId: { type: objectId, ref: "User", required: true },
    adminName: { type: String, default: "Admin" },
    previousStatus: { type: String },
    updatedStatus: { type: String, required: true },
    reason: { type: String, required: true },
    overrideDate: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

const penaltySchema = new Schema(
  {
    requestId: { type: objectId, ref: "BorrowRequest", required: true, index: true },
    studentId: { type: objectId, ref: "User", required: true, index: true },
    itemId: { type: objectId, ref: "InventoryItem" },
    reason: { type: String, required: true },
    amount: { type: Number, min: 0, default: 0 },
    status: {
      type: String,
      enum: ["pending", "paid", "waived"],
      default: "pending",
      index: true
    },
    remarks: { type: String, default: "" }
  },
  { timestamps: true }
);

const itemHistorySchema = new Schema(
  {
    itemId: { type: objectId, ref: "InventoryItem", required: true, index: true },
    requestId: { type: objectId, ref: "BorrowRequest" },
    studentId: { type: objectId, ref: "User" },
    action: { type: String, required: true },
    previousQuantity: { type: Number },
    updatedQuantity: { type: Number },
    remarks: { type: String, default: "" }
  },
  { timestamps: true }
);

const documentSchema = new Schema(
  {
    requestId: { type: objectId, ref: "BorrowRequest", required: true, index: true },
    uploadedBy: { type: objectId, ref: "User", required: true },
    fileName: { type: String, required: true },
    filePath: { type: String, required: true },
    fileType: { type: String }
  },
  { timestamps: true }
);

export const User = models.User || model("User", userSchema);
export const Lab = models.Lab || model("Lab", labSchema);
export const InventoryItem = models.InventoryItem || model("InventoryItem", inventoryItemSchema);
export const BorrowRequest = models.BorrowRequest || model("BorrowRequest", borrowRequestSchema);
export const OverrideLog = models.OverrideLog || model("OverrideLog", overrideLogSchema);
export const Penalty = models.Penalty || model("Penalty", penaltySchema);
export const ItemHistory = models.ItemHistory || model("ItemHistory", itemHistorySchema);
export const Document = models.Document || model("Document", documentSchema);
