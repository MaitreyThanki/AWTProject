import { syncDatabase } from "../models/index.js";

try {
  await syncDatabase();
  console.log("Database tables synchronized");
  process.exit(0);
} catch (error) {
  console.error("Database sync failed:", error.message);
  process.exit(1);
}

