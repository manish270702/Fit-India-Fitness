import Plan from "../models/Plan.js";
import Member from "../models/Member.js";

export async function listPlans(req,res) { res.json({ plans: await Plan.find().sort({ price: 1 }) }); }

export async function createPlan(req,res) {
  const plan = await Plan.create(req.body);
  res.status(201).json({ plan });
}

export async function updatePlan(req,res) {
  const plan = await Plan.findByIdAndUpdate(req.params.id, req.body, {new:true, runValidators:true});
  if (!plan) return res.status(404).json({message:"Plan not found"});
  res.json({plan});
}

export async function deletePlan(req,res) {
  const used = await Member.countDocuments({currentPlan:req.params.id});
  if (used) return res.status(400).json({message:"This plan is assigned to members. Deactivate it instead."});
  await Plan.findByIdAndDelete(req.params.id);
  res.json({message:"Plan deleted"});
}
