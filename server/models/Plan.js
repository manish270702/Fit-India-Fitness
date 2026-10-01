import mongoose from "mongoose";

const schema = new mongoose.Schema({
  name: { type: String, required: true},
  durationMonths: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true, min: 0 },
  personalTrainingPrice: { type: Number, default: 0, min: 0 },
  description: String,
  active: { type: Boolean, default: true },
  gymOwner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
}, { timestamps: true });

export default mongoose.model("Plan", schema);
