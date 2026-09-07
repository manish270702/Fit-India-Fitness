import { Router } from "express";
import { protect } from "../middleware/auth.js";
import { dashboard } from "../controllers/dashboard.js";
const r=Router(); r.use(protect); r.get("/",dashboard); export default r;
