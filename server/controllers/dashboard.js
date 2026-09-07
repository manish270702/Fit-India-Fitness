import Member from "../models/Member.js";
import Payment from "../models/Payment.js";

export async function dashboard(req,res) {
  const members = await Member.find().populate("currentPlan","name price");
  let totalRevenue = 0;
  for (const m of members) {
    m.refreshStatus();
    totalRevenue += 0;
  }
  const payments = await Payment.find();
  totalRevenue = payments.reduce((s,p)=>s+p.amount,0);

  const active = members.filter(m=>m.status==="Active").length;
  const expiring = members.filter(m=>m.status==="Expiring").length;
  const expired = members.filter(m=>m.status==="Expired").length;
  const today = new Date(); today.setHours(0,0,0,0);
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const monthlyRevenue = payments.filter(p=>new Date(p.paymentDate)>=monthStart).reduce((s,p)=>s+p.amount,0);

  const upcoming = members
    .filter(m=>m.membershipEnd && new Date(m.membershipEnd)>=today)
    .sort((a,b)=>new Date(a.membershipEnd)-new Date(b.membershipEnd))
    .slice(0,6);

  res.json({
    stats: { total: members.length, active, expiring, expired, totalRevenue, monthlyRevenue },
    upcoming
  });
}
