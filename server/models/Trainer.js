import mongoose from "mongoose";

const schema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  phone: String,
  specialization: String,
  salary: { type: Number, default: 0 },
  status: { type: String, enum: ["Active", "Inactive"], default: "Active" }
}, { timestamps: true });

export default mongoose.model("Trainer", schema);
