import PersonalTrainingPlan from "../models/PersonalTrainingPlan.js";
import Member from "../models/Member.js";

export async function listPersonalTrainingPlans(req, res) {
  try {
    const ownerId = req.user._id;

    const plans = await PersonalTrainingPlan.find({
      gymOwner: ownerId
    }).sort({
      durationMonths: 1,
      price: 1
    });

    res.json({ plans });
  } catch (error) {
    console.error("List personal training plans error:", error);

    res.status(500).json({
      message: "Failed to fetch personal training plans",
      error: error.message
    });
  }
}

export async function createPersonalTrainingPlan(req, res) {
  try {
    const ownerId = req.user._id;

    const durationMonths = Number(req.body.durationMonths);
    const price = Number(req.body.price);

    if (!req.body.name) {
      return res.status(400).json({
        message: "Plan name is required"
      });
    }

    if (!Number.isFinite(durationMonths) || durationMonths < 1) {
      return res.status(400).json({
        message: "Duration must be at least 1 month"
      });
    }

    if (!Number.isFinite(price) || price < 0) {
      return res.status(400).json({
        message: "Price cannot be negative"
      });
    }

    const plan = await PersonalTrainingPlan.create({
      ...req.body,
      durationMonths,
      price,
      gymOwner: ownerId
    });

    res.status(201).json({ plan });
  } catch (error) {
    console.error("Create personal training plan error:", error);

    // Duplicate plan name for same gym
    if (error.code === 11000) {
      return res.status(400).json({
        message: "A personal training plan with this name already exists"
      });
    }

    res.status(500).json({
      message: "Failed to create personal training plan",
      error: error.message
    });
  }
}

export async function updatePersonalTrainingPlan(req, res) {
  try {
    const ownerId = req.user._id;

    const durationMonths = Number(req.body.durationMonths);
    const price = Number(req.body.price);

    if (!Number.isFinite(durationMonths) || durationMonths < 1) {
      return res.status(400).json({
        message: "Duration must be at least 1 month"
      });
    }

    if (!Number.isFinite(price) || price < 0) {
      return res.status(400).json({
        message: "Price cannot be negative"
      });
    }

    const updates = {
      ...req.body,
      durationMonths,
      price
    };

    // Never allow frontend to change ownership
    delete updates.gymOwner;

    const plan = await PersonalTrainingPlan.findOneAndUpdate(
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

    if (!plan) {
      return res.status(404).json({
        message: "Personal training plan not found"
      });
    }

    res.json({ plan });
  } catch (error) {
    console.error("Update personal training plan error:", error);

    if (error.code === 11000) {
      return res.status(400).json({
        message: "A personal training plan with this name already exists"
      });
    }

    res.status(500).json({
      message: "Failed to update personal training plan",
      error: error.message
    });
  }
}

export async function deletePersonalTrainingPlan(req, res) {
  try {
    const ownerId = req.user._id;

    // Make sure the plan belongs to this gym
    const plan = await PersonalTrainingPlan.findOne({
      _id: req.params.id,
      gymOwner: ownerId
    });

    if (!plan) {
      return res.status(404).json({
        message: "Personal training plan not found"
      });
    }

    // Check only members of this gym
    const used = await Member.countDocuments({
      personalTrainingPlan: plan._id,
      gymOwner: ownerId
    });

    if (used > 0) {
      return res.status(400).json({
        message:
          "This plan is assigned to members. Deactivate it instead."
      });
    }

    await PersonalTrainingPlan.deleteOne({
      _id: plan._id,
      gymOwner: ownerId
    });

    res.json({
      message: "Personal training plan deleted"
    });
  } catch (error) {
    console.error("Delete personal training plan error:", error);

    res.status(500).json({
      message: "Failed to delete personal training plan",
      error: error.message
    });
  }
}