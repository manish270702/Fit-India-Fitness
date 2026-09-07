import { Router } from "express";
import { protect } from "../middleware/auth.js";
import { listPlans,createPlan,updatePlan,deletePlan } from "../controllers/plans.js";
const r=Router(); r.use(protect);
r.get("/",listPlans); r.post("/",createPlan); r.put("/:id",updatePlan); r.delete("/:id",deletePlan);
export default r;
