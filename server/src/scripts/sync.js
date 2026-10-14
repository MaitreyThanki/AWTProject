import { connectDatabase } from "../config/database.js";
import { User, Lab, InventoryItem, BorrowRequest, OverrideLog, Penalty, ItemHistory, Document } from "../models/index.js";
import mongoose from "mongoose";

try {
  await connectDatabase();
  await Promise.all([User, Lab, InventoryItem, BorrowRequest, OverrideLog, Penalty, ItemHistory, Document].map(Model => Model.createIndexes()));
  console.log("MongoDB collections and indexes are ready.");
  await mongoose.disconnect();
  process.exit(0);
} catch (error) {
  console.error("MongoDB initialization failed:", error.message);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
}
