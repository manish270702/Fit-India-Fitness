import Payment from "../models/Payment.js";
import Member from "../models/Member.js";
import Plan from "../models/Plan.js";

export async function listPayments(req, res) {
  const { search = "", method = "All" } = req.query;
  const filter = method !== "All" ? { method } : {};
  let payments = await Payment.find(filter).populate("member", "name phone").populate("plan", "name price").sort({ paymentDate: -1 });
  if (search) payments = payments.filter(p =>
    p.member?.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.member?.phone?.includes(search)
  );
  res.json({ payments });
}

export async function createPayment(req, res) {
  const { member, amount, method, plan, transactionId, paymentDate, note } = req.body;
  if (!member || !amount || !method) return res.status(400).json({ message: "Member, amount and method are required" });
  const memberRecord = await Member.findById(member).select("membershipStart currentPlan personalTraining personalTrainingPlan financials").populate("personalTrainingPlan", "price");
  if (!memberRecord) return res.status(404).json({ message: "Member not found" });
  const paymentData = {
    member,
    amount: Number(amount),
    method,
    plan: plan || memberRecord.currentPlan || null,
    transactionId,
    paymentDate,
    note
  };

  if (!memberRecord.financials) {
    const periodPlan = await Plan.findById(plan || memberRecord.currentPlan).select("price personalTrainingPrice");
    const personalTrainingFee = memberRecord.personalTraining
      ? Number(memberRecord.personalTrainingPlan?.price || periodPlan?.personalTrainingPrice || 0)
      : 0;
    paymentData.membershipPeriodStart = memberRecord.membershipStart;
    paymentData.membershipPeriodFee = Number(periodPlan?.price || 0) + personalTrainingFee;
  }

  const payment = await Payment.create(paymentData);
  if (memberRecord.financials) {
    const totalFees = Number(memberRecord.financials.totalFees || 0);
    const totalPaid = Number(memberRecord.financials.totalPaid || 0) + Number(amount);
    const balance = totalFees - totalPaid;
    await Member.findByIdAndUpdate(member, {
      financials: {
        totalFees,
        totalPaid,
        due: Math.max(balance, 0),
        advance: Math.max(-balance, 0)
      }
    });
  }
  res.status(201).json({ payment: await payment.populate([{ path: "member", select: "name phone" }, { path: "plan", select: "name" }]) });
}

export async function memberPayments(req, res) {
  const payments = await Payment.find({ member: req.params.memberId }).populate("plan", "name").sort({ paymentDate: -1 });
  res.json({ payments });
}
