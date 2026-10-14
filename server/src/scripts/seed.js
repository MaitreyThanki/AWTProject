import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { connectDatabase } from "../config/database.js";
import { InventoryItem, Lab, User } from "../models/index.js";

try {
  await connectDatabase();
  const makersLab = await Lab.findOneAndUpdate(
    { name: "Makers Lab 2" },
    { $setOnInsert: { name: "Makers Lab 2", facultyInchargeName: "Faculty Incharge", facultyInchargeEmail: "faculty.makers@example.edu" } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  const iotLab = await Lab.findOneAndUpdate(
    { name: "Design IoT Lab" },
    { $setOnInsert: { name: "Design IoT Lab", facultyInchargeName: "IoT Faculty", facultyInchargeEmail: "faculty.iot@example.edu" } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  const users = [
    { name: "System Admin", email: "admin@example.edu", password: "admin123", role: "admin" },
    { name: "Faculty Incharge", email: "faculty.makers@example.edu", password: "faculty123", role: "faculty" },
    { name: "IoT Faculty", email: "faculty.iot@example.edu", password: "faculty123", role: "faculty" }
  ];
  for (const data of users) {
    const email = data.email.toLowerCase();
    if (!(await User.exists({ email }))) {
      await User.create({ name: data.name, email, passwordHash: await bcrypt.hash(data.password, 10), role: data.role });
    }
  }

  const inventory = [
    { name: "Arduino Starter Kit", assetCode: "ML2-ARD-001", category: "Microcontrollers", description: "Starter kit for prototyping and embedded projects.", totalQuantity: 10, availableQuantity: 10, condition: "Good", borrowDurationDays: 7, labId: makersLab._id },
    { name: "Sensor Kit", assetCode: "IOT-SEN-001", category: "Sensors", description: "Basic sensor kit for IoT experiments.", totalQuantity: 8, availableQuantity: 8, condition: "Good", borrowDurationDays: 7, labId: iotLab._id }
  ];
  for (const item of inventory) {
    await InventoryItem.updateOne({ assetCode: item.assetCode }, { $setOnInsert: item }, { upsert: true });
  }
  console.log("MongoDB seed data ready. Demo accounts: admin@example.edu / admin123; faculty.makers@example.edu / faculty123");
  await mongoose.disconnect();
  process.exit(0);
} catch (error) {
  console.error("Seed failed:", error.message);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
}
