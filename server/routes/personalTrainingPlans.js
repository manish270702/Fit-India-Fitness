import { Router } from "express";
import { protect } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import {
  listPersonalTrainingPlans,
  createPersonalTrainingPlan,
  updatePersonalTrainingPlan,
  deletePersonalTrainingPlan
} from "../controllers/personalTrainingPlans.js";

const router = Router();
router.use(protect);
router.get("/", asyncHandler(listPersonalTrainingPlans));
router.post("/", asyncHandler(createPersonalTrainingPlan));
router.put("/:id", asyncHandler(updatePersonalTrainingPlan));
router.delete("/:id", asyncHandler(deletePersonalTrainingPlan));

export default router;