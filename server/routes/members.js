import { Router } from "express";
import { protect } from "../middleware/auth.js";
import { listMembers,getMember,createMember,updateMember,deleteMember,renewMember } from "../controllers/members.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
const r=Router(); r.use(protect);
r.get("/",asyncHandler(listMembers)); r.get("/:id",asyncHandler(getMember)); r.post("/",asyncHandler(createMember)); r.put("/:id",asyncHandler(updateMember)); r.delete("/:id",asyncHandler(deleteMember)); r.post("/:id/renew",asyncHandler(renewMember));
export default r;
