import mongoose from "mongoose";

const schema = new mongoose.Schema({
  member: { type: mongoose.Schema.Types.ObjectId, ref: "Member", required: true },
  plan: { type: mongoose.Schema.Types.ObjectId, ref: "Plan" },
  amount: { type: Number, required: true, min: 0 },
  method: { type: String, enum: ["Cash", "UPI", "Bank Transfer", "Card", "Other"], required: true },
  transactionId: String,
  paymentDate: { type: Date, default: Date.now },
  note: String,
  membershipPeriodStart: { type: Date },
  membershipPeriodFee: { type: Number, min: 0 }
}, { timestamps: true });

schema.index({ member: 1, paymentDate: -1 });
schema.index({ method: 1, paymentDate: -1 });

export default mongoose.model("Payment", schema);
