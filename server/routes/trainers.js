import { Router } from "express";
import { protect } from "../middleware/auth.js";
import { listTrainers,createTrainer,updateTrainer,deleteTrainer } from "../controllers/trainers.js";
const r=Router(); r.use(protect);
r.get("/",listTrainers); r.post("/",createTrainer); r.put("/:id",updateTrainer); r.delete("/:id",deleteTrainer);
export default r;
