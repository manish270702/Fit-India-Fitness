import Member from "../models/Member.js";
import Plan from "../models/Plan.js";
import Payment from "../models/Payment.js";
import PersonalTrainingPlan from "../models/PersonalTrainingPlan.js";

const parseDate = value => value ? new Date(value) : null;

export async function listMembers(req, res) {
  const { search="", status="All", plan="All", trainer="All", slot="All" } = req.query;
  const filter = {};
  if (search) filter.$or = [
    { name: { $regex: search, $options: "i" } },
    { phone: { $regex: search, $options: "i" } }
  ];
  if (status !== "All") filter.status = status;
  if (trainer !== "All") filter.trainer = trainer;
  if (slot !== "All") filter.timeSlot = slot;

  let members = await Member.find(filter)
    .populate("trainer", "name")
    .populate("currentPlan", "name durationMonths price personalTrainingPrice")
    .populate("personalTrainingPlan", "name durationMonths price")
    .sort({ createdAt: -1 });

  members.forEach(m => m.refreshStatus());

  if (plan !== "All") members = members.filter(m => m.currentPlan?._id?.toString() === plan);
  res.json({ members });
}

export async function getMember(req, res) {
  const member = await Member.findById(req.params.id)
    .populate("trainer")
    .populate("currentPlan")
    .populate("personalTrainingPlan");
  if (!member) return res.status(404).json({ message: "Member not found" });
  member.refreshStatus();
  await member.save({ validateBeforeSave: false });
  const payments = await Payment.find({ member: member._id }).populate("plan").sort({ paymentDate: -1 });
  res.json({ member, payments });
}

export async function createMember(req, res) {
  const { name, phone, planId, personalTrainingPlanId, paymentAmount, paymentMethod, transactionId, ...data } = req.body;
  if (!name || !phone) return res.status(400).json({ message: "Name and phone are required" });

  if (data.trainer === "") data.trainer = null;
  data.personalTraining = Boolean(data.personalTraining || data.trainer);

  let membershipPeriodFee = 0;
  const member = new Member({
    name, phone, ...data,
    joiningDate: parseDate(data.joiningDate) || new Date(),
    membershipStart: parseDate(data.membershipStart) || new Date()
  });

  if (planId) {
    const plan = await Plan.findById(planId);
    if (!plan) return res.status(400).json({ message: "Invalid plan" });
    member.currentPlan = plan._id;
    membershipPeriodFee = plan.price + (data.personalTraining ? plan.personalTrainingPrice : 0);
    const start = member.membershipStart || new Date();
    const end = new Date(start);
    end.setMonth(end.getMonth() + plan.durationMonths);
    member.membershipEnd = end;

    if (personalTrainingPlanId) {
      const personalTrainingPlan = await PersonalTrainingPlan.findById(personalTrainingPlanId);
      if (!personalTrainingPlan || personalTrainingPlan.durationMonths !== plan.durationMonths) {
        return res.status(400).json({ message: "Personal training plan duration must match the membership plan" });
      }
      member.personalTraining = true;
      member.personalTrainingPlan = personalTrainingPlan._id;
      membershipPeriodFee = plan.price + personalTrainingPlan.price;
    }
  }
  member.refreshStatus();
  await member.save();

  let payment;
  if (paymentAmount && Number(paymentAmount) > 0) {
    payment = await Payment.create({
      member: member._id,
      plan: member.currentPlan,
      membershipPeriodStart: member.membershipStart,
      membershipPeriodFee,
      amount: Number(paymentAmount),
      method: paymentMethod || "Cash",
      transactionId
    });
    payment = await payment.populate([
      { path: "member", select: "name phone" },
      { path: "plan", select: "name" }
    ]);
  }
  const populated = await Member.findById(member._id).populate("trainer").populate("currentPlan").populate("personalTrainingPlan");
  res.status(201).json({ member: populated, payment });
}

export async function updateMember(req, res) {
  const allowed = ["name","phone","gender","address","photo","joiningDate","timeSlot","trainer","personalTraining","personalTrainingPlan","notes","status"];
  const updates = {};
  allowed.forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });
  if (updates.trainer === "") updates.trainer = null;
  if (req.body.trainer !== undefined) {
    updates.personalTraining = Boolean(req.body.personalTraining || updates.trainer);
  }
  if (updates.joiningDate) updates.joiningDate = parseDate(updates.joiningDate);

  if (req.body.planId !== undefined) {
    const plan = await Plan.findById(req.body.planId);
    if (!plan) return res.status(400).json({ message: "Invalid plan" });
    updates.currentPlan = plan._id;
  }

  if (req.body.personalTrainingPlanId !== undefined) {
    const personalTrainingPlan = req.body.personalTrainingPlanId
      ? await PersonalTrainingPlan.findById(req.body.personalTrainingPlanId)
      : null;
    if (req.body.personalTrainingPlanId && !personalTrainingPlan) {
      return res.status(400).json({ message: "Invalid personal training plan" });
    }
    updates.personalTrainingPlan = personalTrainingPlan?._id || null;
    updates.personalTraining = Boolean(personalTrainingPlan);
  }

  const member = await Member.findByIdAndUpdate(req.params.id, updates, { new: true })
    .populate("trainer").populate("currentPlan").populate("personalTrainingPlan");
  if (!member) return res.status(404).json({ message: "Member not found" });
  res.json({ member });
}

export async function deleteMember(req, res) {
  const member = await Member.findByIdAndDelete(req.params.id);
  if (!member) return res.status(404).json({ message: "Member not found" });
  await Payment.deleteMany({ member: member._id });
  res.json({ message: "Member deleted" });
}

export async function renewMember(req, res) {
  const { planId, personalTrainingPlanId, amount, method, transactionId, startDate, note, personalTraining } = req.body;
  const member = await Member.findById(req.params.id);
  if (!member) return res.status(404).json({ message: "Member not found" });
  const plan = await Plan.findById(planId);
  if (!plan) return res.status(400).json({ message: "Invalid plan" });

  const personalTrainingPlan = personalTrainingPlanId
    ? await PersonalTrainingPlan.findById(personalTrainingPlanId)
    : null;
  if (personalTrainingPlanId && (!personalTrainingPlan || personalTrainingPlan.durationMonths !== plan.durationMonths)) {
    return res.status(400).json({ message: "Personal training plan duration must match the membership plan" });
  }

  const start = parseDate(startDate) || (
    member.membershipEnd && new Date(member.membershipEnd) > new Date()
      ? new Date(member.membershipEnd)
      : new Date()
  );
  const end = new Date(start);
  end.setMonth(end.getMonth() + plan.durationMonths);

  member.currentPlan = plan._id;
  member.personalTraining = Boolean(personalTrainingPlan || personalTraining);
  member.personalTrainingPlan = personalTrainingPlan?._id || null;
  member.membershipStart = start;
  member.membershipEnd = end;
  member.refreshStatus();
  await member.save();

  let payment;
  if (Number(amount) > 0) {
    const personalTrainingFee = personalTrainingPlan?.price || (personalTraining ? plan.personalTrainingPrice : 0);
    payment = await Payment.create({ member: member._id, plan: plan._id, membershipPeriodStart: start, membershipPeriodFee: plan.price + personalTrainingFee, amount: Number(amount), method: method || "Cash", transactionId, note: note || "Membership renewal" });
    payment = await payment.populate([
      { path: "member", select: "name phone" },
      { path: "plan", select: "name" }
    ]);
  }
  const populated = await Member.findById(member._id).populate("trainer").populate("currentPlan").populate("personalTrainingPlan");
  res.json({ member: populated, payment });
}
