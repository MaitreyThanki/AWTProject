import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import helmet from "helmet";

import routes from "./routes/index.js";
import { errorHandler } from "./middleware/errorHandler.js";

dotenv.config();

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads"));

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "inventory-management-api" });
});

app.use("/api", routes);
app.use(errorHandler);

export default app;

