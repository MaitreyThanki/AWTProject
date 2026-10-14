import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import mongoose from "mongoose";
import { connectDatabase } from "./config/database.js";

const port = process.env.PORT || 5000;

async function startServer() {
  try {
    await connectDatabase();
    app.listen(port, () => console.log(`API server running on http://localhost:${port}`));
  } catch (error) {
    console.error("Unable to start server:", error.message);
    await mongoose.disconnect().catch(() => {});
    process.exit(1);
  }
}

startServer();
