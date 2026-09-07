import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.js";
import memberRoutes from "./routes/members.js";
import paymentRoutes from "./routes/payments.js";
import planRoutes from "./routes/plans.js";
import trainerRoutes from "./routes/trainers.js";
import dashboardRoutes from "./routes/dashboard.js";
import connectToDb from "./db/db.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
  })
);

app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

app.get("/", (_, res) => {
  res.json({ message: "FitGym API is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/members", memberRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/plans", planRoutes);
app.use("/api/trainers", trainerRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.use((err, req, res, next) => {
  console.error(err);

  res.status(err.status || 500).json({
    message: err.message || "Server error",
  });
});

const startServer = async () => {
  try {
    await connectToDb();

    app.listen(port, () => {
      console.log(`FitGym API: http://localhost:${port}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
};

startServer();