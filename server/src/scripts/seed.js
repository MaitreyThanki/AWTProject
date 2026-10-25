import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { connectDatabase } from "../config/database.js";
import { InventoryItem, Lab, User } from "../models/index.js";

async function seed() {
  try {
    await connectDatabase();

    // 1. Labs
    const makersLab = await Lab.findOneAndUpdate(
      { name: "Makers Lab 2" },
      {
        $set: {
          name: "Makers Lab 2",
          facultyInchargeName: "Dr. Rajesh Sharma",
          facultyInchargeEmail: "faculty.makers@university.edu"
        }
      },
      { upsert: true, new: true }
    );

    const iotLab = await Lab.findOneAndUpdate(
      { name: "Design IoT Lab" },
      {
        $set: {
          name: "Design IoT Lab",
          facultyInchargeName: "Prof. Ananya Verma",
          facultyInchargeEmail: "faculty.iot@university.edu"
        }
      },
      { upsert: true, new: true }
    );

    // 2. Demo Users
    const defaultPasswordHash = await bcrypt.hash("password123", 10);

    const usersToSeed = [
      {
        name: "Admin Officer",
        email: "admin@university.edu",
        role: "admin",
        totpSecret: "JBSWY3DPEHPK3PXP" // Authenticator secret
      },
      {
        name: "Dr. Rajesh Sharma",
        email: "faculty.makers@university.edu",
        role: "faculty",
        passwordHash: defaultPasswordHash,
        assignedLabId: makersLab._id
      },
      {
        name: "Prof. Ananya Verma",
        email: "faculty.iot@university.edu",
        role: "faculty",
        passwordHash: defaultPasswordHash,
        assignedLabId: iotLab._id
      },
      {
        name: "Aarav Patel",
        email: "student@university.edu",
        role: "student",
        passwordHash: defaultPasswordHash,
        phone: "+91 9876543210",
        enrollmentNumber: "25BT04D251",
        universityProgram: "B.Tech Computer Science",
        semester: "5",
        division: "B",
        residenceType: "hostel"
      }
    ];

    for (const u of usersToSeed) {
      await User.findOneAndUpdate(
        { email: u.email },
        { $set: u },
        { upsert: true, new: true }
      );
    }

    // 3. Inventory Items for Makers Lab 2 and Design IoT Lab
    const inventory = [
      // Makers Lab 2
      {
        name: "Arduino Uno R3 Starter Kit",
        assetCode: "ML2-ARD-001",
        category: "Microcontrollers",
        description: "Official Arduino Uno R3 development board with breadboard and starter component bundle.",
        totalQuantity: 15,
        availableQuantity: 15,
        condition: "Good",
        borrowDurationDays: 7,
        labId: makersLab._id
      },
      {
        name: "Raspberry Pi 4 Model B (4GB)",
        assetCode: "ML2-RPI-002",
        category: "Microcontrollers",
        description: "Quad-core 64-bit single board computer with dual micro-HDMI display outputs.",
        totalQuantity: 8,
        availableQuantity: 8,
        condition: "Good",
        borrowDurationDays: 5,
        labId: makersLab._id
      },
      {
        name: "Digital Multimeter Fluke 101",
        assetCode: "ML2-DMM-003",
        category: "Measuring instruments",
        description: "Compact basic digital multimeter for voltage, resistance, and continuity testing.",
        totalQuantity: 12,
        availableQuantity: 12,
        condition: "Good",
        borrowDurationDays: 3,
        labId: makersLab._id
      },
      {
        name: "Soldering Station 60W Adjustable",
        assetCode: "ML2-SLD-004",
        category: "Mechanical tools",
        description: "Temperature-controlled soldering station with stand and brass sponge cleaner.",
        totalQuantity: 6,
        availableQuantity: 6,
        condition: "Good",
        borrowDurationDays: 2,
        labId: makersLab._id
      },

      // Design IoT Lab
      {
        name: "ESP32 NodeMCU Development Board",
        assetCode: "IOT-ESP-101",
        category: "Microcontrollers",
        description: "Dual-core Wi-Fi & Bluetooth microcontroller module for IoT prototyping.",
        totalQuantity: 20,
        availableQuantity: 20,
        condition: "Good",
        borrowDurationDays: 7,
        labId: iotLab._id
      },
      {
        name: "37-in-1 Sensor Module Kit",
        assetCode: "IOT-SEN-102",
        category: "Sensors",
        description: "Comprehensive sensor pack including DHT11, ultrasonic, flame, light, and motion sensors.",
        totalQuantity: 10,
        availableQuantity: 10,
        condition: "Good",
        borrowDurationDays: 7,
        labId: iotLab._id
      },
      {
        name: "LoRa SX1278 RF Transceiver Module",
        assetCode: "IOT-LRA-103",
        category: "Electronics",
        description: "Long-range wireless communication module (433MHz) with antenna.",
        totalQuantity: 10,
        availableQuantity: 10,
        condition: "Good",
        borrowDurationDays: 7,
        labId: iotLab._id
      },
      {
        name: "Digital Storage Oscilloscope (20MHz)",
        assetCode: "IOT-OSC-104",
        category: "Measuring instruments",
        description: "Dual-channel portable oscilloscope for signal analysis and waveform inspection.",
        totalQuantity: 4,
        availableQuantity: 4,
        condition: "Good",
        borrowDurationDays: 2,
        labId: iotLab._id
      }
    ];

    for (const item of inventory) {
      await InventoryItem.findOneAndUpdate(
        { assetCode: item.assetCode },
        { $set: item },
        { upsert: true }
      );
    }

    console.log("Database seeded successfully!");
    console.log("Demo Accounts:");
    console.log("- Admin: admin@university.edu (TOTP Authenticator code with secret: JBSWY3DPEHPK3PXP)");
    console.log("- Faculty (Makers Lab 2): faculty.makers@university.edu / password123");
    console.log("- Faculty (Design IoT Lab): faculty.iot@university.edu / password123");
    console.log("- Student: student@university.edu / password123");

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("Seed failed:", error);
    await mongoose.disconnect().catch(() => {});
    process.exit(1);
  }
}

seed();
