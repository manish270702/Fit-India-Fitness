import Member from "../models/Member.js";
import Plan from "../models/Plan.js";
import Payment from "../models/Payment.js";

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
    .populate("currentPlan", "name durationMonths price")
    .sort({ createdAt: -1 });

  members.forEach(m => m.refreshStatus());
  await Promise.all(members.map(m => m.save({ validateBeforeSave: false })));

  if (plan !== "All") members = members.filter(m => m.currentPlan?._id?.toString() === plan);
  res.json({ members });
}

export async function getMember(req, res) {
  const member = await Member.findById(req.params.id)
    .populate("trainer")
    .populate("currentPlan");
  if (!member) return res.status(404).json({ message: "Member not found" });
  member.refreshStatus();
  await member.save({ validateBeforeSave: false });
  const payments = await Payment.find({ member: member._id }).populate("plan").sort({ paymentDate: -1 });
  res.json({ member, payments });
}

export async function createMember(req, res) {
  const { name, phone, planId, paymentAmount, paymentMethod, transactionId, ...data } = req.body;
  if (!name || !phone) return res.status(400).json({ message: "Name and phone are required" });

  const member = new Member({
    name, phone, ...data,
    joiningDate: parseDate(data.joiningDate) || new Date(),
    membershipStart: parseDate(data.membershipStart) || new Date()
  });

  if (planId) {
    const plan = await Plan.findById(planId);
    if (!plan) return res.status(400).json({ message: "Invalid plan" });
    member.currentPlan = plan._id;
    const start = member.membershipStart || new Date();
    const end = new Date(start);
    end.setMonth(end.getMonth() + plan.durationMonths);
    member.membershipEnd = end;
  }
  member.refreshStatus();
  await member.save();

  if (paymentAmount && Number(paymentAmount) > 0) {
    await Payment.create({
      member: member._id,
      plan: member.currentPlan,
      amount: Number(paymentAmount),
      method: paymentMethod || "Cash",
      transactionId
    });
  }
  const populated = await Member.findById(member._id).populate("trainer").populate("currentPlan");
  res.status(201).json({ member: populated });
}

export async function updateMember(req, res) {
  const allowed = ["name","phone","gender","address","photo","joiningDate","timeSlot","trainer","notes","status"];
  const updates = {};
  allowed.forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });
  if (updates.joiningDate) updates.joiningDate = parseDate(updates.joiningDate);

  if (req.body.planId !== undefined) {
    const plan = await Plan.findById(req.body.planId);
    if (!plan) return res.status(400).json({ message: "Invalid plan" });
    updates.currentPlan = plan._id;
  }

  const member = await Member.findByIdAndUpdate(req.params.id, updates, { new: true })
    .populate("trainer").populate("currentPlan");
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
  const { planId, amount, method, transactionId, startDate, note } = req.body;
  const member = await Member.findById(req.params.id);
  if (!member) return res.status(404).json({ message: "Member not found" });
  const plan = await Plan.findById(planId);
  if (!plan) return res.status(400).json({ message: "Invalid plan" });

  const start = parseDate(startDate) || (
    member.membershipEnd && new Date(member.membershipEnd) > new Date()
      ? new Date(member.membershipEnd)
      : new Date()
  );
  const end = new Date(start);
  end.setMonth(end.getMonth() + plan.durationMonths);

  member.currentPlan = plan._id;
  member.membershipStart = start;
  member.membershipEnd = end;
  member.refreshStatus();
  await member.save();

  let payment;
  if (Number(amount) > 0) {
    payment = await Payment.create({ member: member._id, plan: plan._id, amount: Number(amount), method: method || "Cash", transactionId, note: note || "Membership renewal" });
    payment = await payment.populate([
      { path: "member", select: "name phone" },
      { path: "plan", select: "name" }
    ]);
  }
  const populated = await Member.findById(member._id).populate("trainer").populate("currentPlan");
  res.json({ member: populated, payment });
}
