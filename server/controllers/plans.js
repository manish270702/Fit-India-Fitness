import Plan from "../models/Plan.js";
import Member from "../models/Member.js";

export async function listPlans(req, res) {
  try {
    const ownerId = req.user._id;

    const plans = await Plan.find({
      gymOwner: ownerId
    }).sort({ price: 1 });

    res.json({ plans });
  } catch (error) {
    console.error("List plans error:", error);

    res.status(500).json({
      message: "Failed to fetch plans",
      error: error.message
    });
  }
}

export async function createPlan(req, res) {
  try {
    const ownerId = req.user._id;

    const plan = await Plan.create({
      ...req.body,
      gymOwner: ownerId
    });

    res.status(201).json({ plan });
  } catch (error) {
    console.error("Create plan error:", error);

    if (error.code === 11000) {
      return res.status(400).json({
        message: "A plan with this name already exists"
      });
    }

    res.status(500).json({
      message: "Failed to create plan",
      error: error.message
    });
  }
}

export async function updatePlan(req, res) {
  try {
    const ownerId = req.user._id;

    const allowedUpdateFields = [
      "name",
      "description",
      "price",
      "durationDays",
      "isActive"
    ];

    const updates = {};
    for (const field of allowedUpdateFields) {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        updates[field] = req.body[field];
      }
    }

    const plan = await Plan.findOneAndUpdate(
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
        message: "Plan not found"
      });
    }

    res.json({ plan });
  } catch (error) {
    console.error("Update plan error:", error);

    if (error.code === 11000) {
      return res.status(400).json({
        message: "A plan with this name already exists"
      });
    }

    res.status(500).json({
      message: "Failed to update plan",
      error: error.message
    });
  }
}

export async function deletePlan(req, res) {
  try {
    const ownerId = req.user._id;

    // Make sure the plan belongs to this gym
    const plan = await Plan.findOne({
      _id: req.params.id,
      gymOwner: ownerId
    });

    if (!plan) {
      return res.status(404).json({
        message: "Plan not found"
      });
    }

    // Check only members belonging to this gym
    const used = await Member.countDocuments({
      currentPlan: plan._id,
      gymOwner: ownerId
    });

    if (used > 0) {
      return res.status(400).json({
        message:
          "This plan is assigned to members. Deactivate it instead."
      });
    }

    await Plan.deleteOne({
      _id: plan._id,
      gymOwner: ownerId
    });

    res.json({
      message: "Plan deleted"
    });
  } catch (error) {
    console.error("Delete plan error:", error);

    res.status(500).json({
      message: "Failed to delete plan",
      error: error.message
    });
  }
}