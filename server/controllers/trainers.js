import Trainer from "../models/Trainer.js";

export async function listTrainers(req,res){ res.json({trainers: await Trainer.find().sort({name:1})}); }
export async function createTrainer(req,res){ const trainer=await Trainer.create(req.body); res.status(201).json({trainer}); }
export async function updateTrainer(req,res){ const trainer=await Trainer.findByIdAndUpdate(req.params.id,req.body,{new:true,runValidators:true}); if(!trainer)return res.status(404).json({message:"Trainer not found"}); res.json({trainer}); }
export async function deleteTrainer(req,res){ await Trainer.findByIdAndDelete(req.params.id); res.json({message:"Trainer deleted"}); }
