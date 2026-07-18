import bcrypt from "bcryptjs";
import { InventoryItem, Lab, User, sequelize, syncDatabase } from "../models/index.js";

try {
  await syncDatabase();

  const [makersLab] = await Lab.findOrCreate({
    where: { name: "Makers Lab 2" },
    defaults: {
      facultyInchargeName: "Faculty Incharge",
      facultyInchargeEmail: "faculty.makers@example.edu"
    }
  });

  const [iotLab] = await Lab.findOrCreate({
    where: { name: "Design IoT Lab" },
    defaults: {
      facultyInchargeName: "IoT Faculty",
      facultyInchargeEmail: "faculty.iot@example.edu"
    }
  });

  await User.findOrCreate({
    where: { email: "admin@example.edu" },
    defaults: {
      name: "System Admin",
      email: "admin@example.edu",
      passwordHash: await bcrypt.hash("admin123", 10),
      role: "admin"
    }
  });

  await User.findOrCreate({
    where: { email: "faculty.makers@example.edu" },
    defaults: {
      name: "Faculty Incharge",
      email: "faculty.makers@example.edu",
      passwordHash: await bcrypt.hash("faculty123", 10),
      role: "faculty"
    }
  });

  await InventoryItem.findOrCreate({
    where: { assetCode: "ML2-ARD-001" },
    defaults: {
      name: "Arduino Starter Kit",
      assetCode: "ML2-ARD-001",
      category: "Microcontrollers",
      description: "Starter kit for prototyping and embedded projects.",
      totalQuantity: 10,
      availableQuantity: 10,
      condition: "Good",
      borrowDurationDays: 7,
      LabId: makersLab.id
    }
  });

  await InventoryItem.findOrCreate({
    where: { assetCode: "IOT-SEN-001" },
    defaults: {
      name: "Sensor Kit",
      assetCode: "IOT-SEN-001",
      category: "Sensors",
      description: "Basic sensor kit for IoT experiments.",
      totalQuantity: 8,
      availableQuantity: 8,
      condition: "Good",
      borrowDurationDays: 7,
      LabId: iotLab.id
    }
  });

  await sequelize.close();
  console.log("Seed data created");
  process.exit(0);
} catch (error) {
  console.error("Seed failed:", error.message);
  process.exit(1);
}

