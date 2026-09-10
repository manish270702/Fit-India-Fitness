import PersonalTrainingPlan from "../models/PersonalTrainingPlan.js";
import Member from "../models/Member.js";

export async function listPersonalTrainingPlans(req, res) {
  res.json({ plans: await PersonalTrainingPlan.find().sort({ durationMonths: 1, price: 1 }) });
}

export async function createPersonalTrainingPlan(req, res) {
  const plan = await PersonalTrainingPlan.create({
    ...req.body,
    durationMonths: Number(req.body.durationMonths),
    price: Number(req.body.price)
  });
  res.status(201).json({ plan });
}

export async function updatePersonalTrainingPlan(req, res) {
  const plan = await PersonalTrainingPlan.findByIdAndUpdate(
    req.params.id,
    { ...req.body, durationMonths: Number(req.body.durationMonths), price: Number(req.body.price) },
    { new: true, runValidators: true }
  );
  if (!plan) return res.status(404).json({ message: "Personal training plan not found" });
  res.json({ plan });
}

export async function deletePersonalTrainingPlan(req, res) {
  const used = await Member.countDocuments({ personalTrainingPlan: req.params.id });
  if (used) return res.status(400).json({ message: "This plan is assigned to members. Deactivate it instead." });
  const plan = await PersonalTrainingPlan.findByIdAndDelete(req.params.id);
  if (!plan) return res.status(404).json({ message: "Personal training plan not found" });
  res.json({ message: "Personal training plan deleted" });
}