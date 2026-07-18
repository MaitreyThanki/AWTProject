import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

export { sequelize };

export const User = sequelize.define("User", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  passwordHash: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.ENUM("student", "faculty", "admin"), allowNull: false },
  phone: DataTypes.STRING,
  enrollmentNumber: DataTypes.STRING,
  universityProgram: DataTypes.STRING,
  semester: DataTypes.STRING,
  division: DataTypes.STRING,
  residenceType: DataTypes.ENUM("home", "hostel")
});

export const Lab = sequelize.define("Lab", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false, unique: true },
  facultyInchargeName: DataTypes.STRING,
  facultyInchargeEmail: DataTypes.STRING
});

export const InventoryItem = sequelize.define("InventoryItem", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  assetCode: { type: DataTypes.STRING, allowNull: false, unique: true },
  category: DataTypes.STRING,
  description: DataTypes.TEXT,
  totalQuantity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  availableQuantity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  condition: DataTypes.STRING,
  status: { type: DataTypes.ENUM("available", "unavailable", "damaged"), defaultValue: "available" },
  borrowDurationDays: { type: DataTypes.INTEGER, defaultValue: 7 },
  imageUrl: DataTypes.STRING
});

export const BorrowRequest = sequelize.define("BorrowRequest", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  expectedBorrowDate: DataTypes.DATEONLY,
  expectedReturnDate: DataTypes.DATEONLY,
  actualReturnDate: DataTypes.DATEONLY,
  purpose: DataTypes.TEXT,
  status: {
    type: DataTypes.ENUM("pending", "approved", "rejected", "issued", "returned", "overdue", "cancelled"),
    defaultValue: "pending"
  },
  facultyRemarks: DataTypes.TEXT,
  adminRemarks: DataTypes.TEXT
});

export const BorrowRequestItem = sequelize.define("BorrowRequestItem", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  quantityRequested: { type: DataTypes.INTEGER, allowNull: false },
  quantityIssued: { type: DataTypes.INTEGER, defaultValue: 0 },
  returnStatus: { type: DataTypes.ENUM("pending", "issued", "returned", "damaged", "lost"), defaultValue: "pending" }
});

export const Document = sequelize.define("Document", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  uploadedBy: DataTypes.STRING,
  fileName: DataTypes.STRING,
  filePath: DataTypes.STRING,
  fileType: DataTypes.STRING
});

export const Approval = sequelize.define("Approval", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  decision: { type: DataTypes.ENUM("approved", "rejected"), allowNull: false },
  remarks: DataTypes.TEXT,
  decisionDate: DataTypes.DATE
});

export const OverrideLog = sequelize.define("OverrideLog", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  previousStatus: DataTypes.STRING,
  updatedStatus: DataTypes.STRING,
  reason: DataTypes.TEXT,
  overrideDate: DataTypes.DATE
});

export const Penalty = sequelize.define("Penalty", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  reason: DataTypes.STRING,
  amount: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  status: { type: DataTypes.ENUM("pending", "paid", "waived"), defaultValue: "pending" },
  remarks: DataTypes.TEXT
});

export const ItemHistory = sequelize.define("ItemHistory", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  action: DataTypes.STRING,
  previousQuantity: DataTypes.INTEGER,
  updatedQuantity: DataTypes.INTEGER,
  remarks: DataTypes.TEXT
});

Lab.hasMany(InventoryItem);
InventoryItem.belongsTo(Lab);

User.hasMany(BorrowRequest, { foreignKey: "studentId" });
BorrowRequest.belongsTo(User, { as: "student", foreignKey: "studentId" });

BorrowRequest.hasMany(BorrowRequestItem);
BorrowRequestItem.belongsTo(BorrowRequest);
InventoryItem.hasMany(BorrowRequestItem);
BorrowRequestItem.belongsTo(InventoryItem);

BorrowRequest.hasMany(Document);
Document.belongsTo(BorrowRequest);

BorrowRequest.hasMany(Approval);
Approval.belongsTo(BorrowRequest);
User.hasMany(Approval, { foreignKey: "facultyId" });

BorrowRequest.hasMany(OverrideLog);
OverrideLog.belongsTo(BorrowRequest);
User.hasMany(OverrideLog, { foreignKey: "adminId" });

BorrowRequest.hasMany(Penalty);
Penalty.belongsTo(BorrowRequest);
InventoryItem.hasMany(Penalty);
Penalty.belongsTo(InventoryItem);
User.hasMany(Penalty, { foreignKey: "studentId" });

InventoryItem.hasMany(ItemHistory);
ItemHistory.belongsTo(InventoryItem);
BorrowRequest.hasMany(ItemHistory);
ItemHistory.belongsTo(BorrowRequest);
User.hasMany(ItemHistory, { foreignKey: "studentId" });

export async function syncDatabase() {
  await sequelize.sync({ alter: true });
}
