import { Router } from "express";
import { protect } from "../middleware/auth.js";
import { listPayments,createPayment,memberPayments } from "../controllers/payments.js";
const r=Router(); r.use(protect);
r.get("/",listPayments); r.post("/",createPayment); r.get("/member/:memberId",memberPayments);
export default r;
