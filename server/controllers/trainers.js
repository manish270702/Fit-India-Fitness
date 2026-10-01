import Trainer from "../models/Trainer.js";
import Member from "../models/Member.js";

export async function listTrainers(req, res) {
	try {
		const ownerId = req.user._id;

		const trainers = await Trainer.find({
			gymOwner: ownerId
		}).sort({ name: 1 });

		res.json({ trainers });
	} catch (error) {
		console.error("List trainers error:", error);

		res.status(500).json({
			message: "Failed to fetch trainers",
			error: error.message
		});
	}
}

export async function createTrainer(req, res) {
	try {
		const ownerId = req.user._id;

		const trainer = await Trainer.create({
			...req.body,
			gymOwner: ownerId
		});

		res.status(201).json({ trainer });
	} catch (error) {
		console.error("Create trainer error:", error);

		if (error.code === 11000) {
			return res.status(400).json({
				message: "A trainer with this phone number already exists"
			});
		}

		res.status(500).json({
			message: "Failed to create trainer",
			error: error.message
		});
	}
}

export async function updateTrainer(req, res) {
	try {
		const ownerId = req.user._id;

		const updates = {
			...req.body
		};

		// Never allow frontend to change gym ownership
		delete updates.gymOwner;

		const trainer = await Trainer.findOneAndUpdate(
			{
				_id: req.params.id,
				gymOwner: ownerId
			},
			updates,
			{
				new: true,
				runValidators: true
			}
		);

		if (!trainer) {
			return res.status(404).json({
				message: "Trainer not found"
			});
		}

		res.json({ trainer });
	} catch (error) {
		console.error("Update trainer error:", error);

		if (error.code === 11000) {
			return res.status(400).json({
				message: "A trainer with this phone number already exists"
			});
		}

		res.status(500).json({
			message: "Failed to update trainer",
			error: error.message
		});
	}
}

export async function deleteTrainer(req, res) {
	try {
		const ownerId = req.user._id;

		// Make sure trainer belongs to this gym
		const trainer = await Trainer.findOne({
			_id: req.params.id,
			gymOwner: ownerId
		});

		if (!trainer) {
			return res.status(404).json({
				message: "Trainer not found"
			});
		}

		// Remove trainer from members of this gym only
		await Member.updateMany(
			{
				trainer: trainer._id,
				gymOwner: ownerId
			},
			{
				$set: {
					trainer: null,
					personalTraining: false,
					personalTrainingPlan: null
				}
			}
		);

		await Trainer.deleteOne({
			_id: trainer._id,
			gymOwner: ownerId
		});

		res.json({
			message: "Trainer deleted"
		});
	} catch (error) {
		console.error("Delete trainer error:", error);

		res.status(500).json({
			message: "Failed to delete trainer",
			error: error.message
		});
	}
}