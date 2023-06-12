import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import morgan from "morgan";
import authRouter from "./routes/auth.router.js";
import resetPwdRouter from "./routes/resetPwd.routes.js";
import { connectToMailServer } from "./services/mail.services.js";

/* CONFIGURATIONS */
dotenv.config();
const app = express();
app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const errorMessage = err.message || "Internal Server Error";

  res.status(statusCode).json({ error: errorMessage });
});
app.use(morgan("common"));
app.use(cors());

/* ROUTES */
app.use("/auth", authRouter);
app.use("/reset", resetPwdRouter);

/* MONGOOSE SETUP */
const PORT = process.env.PORT || 6001;

connectToMailServer();

mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on("error", (error) => {
  console.error("MongoDB connection error:", error);
});

db.once("connected", () => {
  console.log("Connected to MongoDB");
  // Start your Express server here
  app.listen(PORT, () => {
    console.log("Server is running on port " + PORT);
  });
});
