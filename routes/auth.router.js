import express from "express";
import { generateQR, login, register } from "../controllers/auth.controller.js";
import { verifyToken } from "../middleware/auth.js";

const authRouter = express.Router();

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.get("/qr", [verifyToken], generateQR);

export default authRouter;
