import { Router } from "express";
import { protect } from "../middleware/auth.js";
import { dashboard } from "../controllers/dashboard.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
const r=Router(); r.use(protect); r.get("/",asyncHandler(dashboard)); export default r;
