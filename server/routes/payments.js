import { Router } from "express";
import { protect } from "../middleware/auth.js";
import { listPayments,createPayment,memberPayments } from "../controllers/payments.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
const r=Router(); r.use(protect);
r.get("/",asyncHandler(listPayments)); r.post("/",asyncHandler(createPayment)); r.get("/member/:memberId",asyncHandler(memberPayments));
export default r;
