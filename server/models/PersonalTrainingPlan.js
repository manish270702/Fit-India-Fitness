import mongoose from "mongoose";

const schema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  durationMonths: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true, min: 0 },
  description: String,
  active: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model("PersonalTrainingPlan", schema);