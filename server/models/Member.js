import mongoose from "mongoose";

const schema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  phone: { type: String, required: true, trim: true, index: true },
  gender: { type: String, enum: ["Male", "Female", "Other"], default: "Male" },
  address: String,
  photo: String,
  joiningDate: { type: Date, default: Date.now },
  timeSlot: String,
  trainer: { type: mongoose.Schema.Types.ObjectId, ref: "Trainer", default: null },
  currentPlan: { type: mongoose.Schema.Types.ObjectId, ref: "Plan", default: null },
  membershipStart: Date,
  membershipEnd: Date,
  status: { type: String, enum: ["Active", "Expiring", "Expired", "Inactive"], default: "Active" },
  notes: String
}, { timestamps: true });

schema.methods.refreshStatus = function() {
  if (!this.membershipEnd) {
    this.status = "Inactive";
    return this.status;
  }
  const today = new Date();
  today.setHours(0,0,0,0);
  const end = new Date(this.membershipEnd);
  end.setHours(0,0,0,0);
  const diff = Math.ceil((end - today) / 86400000);
  this.status = diff < 0 ? "Expired" : diff <= 30 ? "Expiring" : "Active";
  return this.status;
};

export default mongoose.model("Member", schema);
