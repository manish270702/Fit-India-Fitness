import { Router } from "express";
import { protect } from "../middleware/auth.js";
import { listPlans,createPlan,updatePlan,deletePlan } from "../controllers/plans.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
const r=Router(); r.use(protect);
r.get("/",asyncHandler(listPlans)); r.post("/",asyncHandler(createPlan)); r.put("/:id",asyncHandler(updatePlan)); r.delete("/:id",asyncHandler(deletePlan));
export default r;
