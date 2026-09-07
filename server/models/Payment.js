import mongoose from "mongoose";

const schema = new mongoose.Schema({
  member: { type: mongoose.Schema.Types.ObjectId, ref: "Member", required: true, index: true },
  plan: { type: mongoose.Schema.Types.ObjectId, ref: "Plan" },
  amount: { type: Number, required: true, min: 0 },
  method: { type: String, enum: ["Cash", "UPI", "Bank Transfer", "Card", "Other"], required: true },
  transactionId: String,
  paymentDate: { type: Date, default: Date.now },
  note: String
}, { timestamps: true });

export default mongoose.model("Payment", schema);
