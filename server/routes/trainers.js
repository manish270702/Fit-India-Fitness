import { Router } from "express";
import { protect } from "../middleware/auth.js";
import { listTrainers,createTrainer,updateTrainer,deleteTrainer } from "../controllers/trainers.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
const r=Router(); r.use(protect);
r.get("/",asyncHandler(listTrainers)); r.post("/",asyncHandler(createTrainer)); r.put("/:id",asyncHandler(updateTrainer)); r.delete("/:id",asyncHandler(deleteTrainer));
export default r;
