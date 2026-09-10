import { Router } from "express";
import { protect } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { getImageKitAuth } from "../controllers/imagekit.js";

const router = Router();

router.get("/auth", protect, asyncHandler(getImageKitAuth));

export default router;