import { Router } from "express";
import { protect } from "../middleware/auth.js";
import { listMembers,getMember,createMember,updateMember,deleteMember,renewMember } from "../controllers/members.js";
const r=Router(); r.use(protect);
r.get("/",listMembers); r.get("/:id",getMember); r.post("/",createMember); r.put("/:id",updateMember); r.delete("/:id",deleteMember); r.post("/:id/renew",renewMember);
export default r;
