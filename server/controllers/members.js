
import Member from "../models/Member.js";
import Plan from "../models/Plan.js";
import Payment from "../models/Payment.js";
import PersonalTrainingPlan from "../models/PersonalTrainingPlan.js";
import Trainer from "../models/Trainer.js";

const parseDate = (value) => (value ? new Date(value) : null);

/*
|--------------------------------------------------------------------------
| LIST MEMBERS
|--------------------------------------------------------------------------
*/
export async function listMembers(req, res) {
  try {
    const {
      search = "",
      status = "All",
      plan = "All",
      trainer = "All",
      slot = "All"
    } = req.query;

    const filter = {
      gymOwner: req.user._id
    };

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } }
      ];
    }

    if (status !== "All") {
      filter.status = status;
    }

    if (trainer !== "All") {
      filter.trainer = trainer;
    }

    if (slot !== "All") {
      filter.timeSlot = slot;
    }

    let members = await Member.find(filter)
      .populate("trainer", "name")
      .populate(
        "currentPlan",
        "name durationMonths price personalTrainingPrice"
      )
      .populate(
        "personalTrainingPlan",
        "name durationMonths price"
      )
      .sort({ createdAt: -1 });

    members.forEach((member) => {
      member.refreshStatus();
    });

    if (plan !== "All") {
      members = members.filter(
        (member) => member.currentPlan?._id?.toString() === plan
      );
    }

    res.json({ members });
  } catch (error) {
    console.error("listMembers error:", error);
    res.status(500).json({ message: "Failed to fetch members" });
  }
}

/*
|--------------------------------------------------------------------------
| GET SINGLE MEMBER
|--------------------------------------------------------------------------
*/
export async function getMember(req, res) {
  try {
    const member = await Member.findOne({
      _id: req.params.id,
      gymOwner: req.user._id
    })
      .populate("trainer")
      .populate("currentPlan")
      .populate("personalTrainingPlan");

    if (!member) {
      return res.status(404).json({
        message: "Member not found"
      });
    }

    member.refreshStatus();

    await member.save({
      validateBeforeSave: false
    });

    // Only get payments belonging to this gym owner
    const payments = await Payment.find({
      member: member._id,
      gymOwner: req.user._id
    })
      .populate("plan")
      .sort({ paymentDate: -1 });

    res.json({
      member,
      payments
    });
  } catch (error) {
    console.error("getMember error:", error);
    res.status(500).json({
      message: "Failed to fetch member"
    });
  }
}

/*
|--------------------------------------------------------------------------
| CREATE MEMBER
|--------------------------------------------------------------------------
*/
export async function createMember(req, res) {
  try {
    const {
      name,
      phone,
      planId,
      personalTrainingPlanId,
      paymentAmount,
      paymentMethod,
      transactionId,
      discount,
      ...data
    } = req.body;

    if (!name || !phone) {
      return res.status(400).json({
        message: "Name and phone are required"
      });
    }

    const ownerId = req.user._id;

    const discountAmount = Math.max(
      Number(discount) || 0,
      0
    );

    if (data.trainer === "") {
      data.trainer = null;
    }

    data.personalTraining = Boolean(
      data.personalTraining || data.trainer
    );

    /*
    |--------------------------------------------------------------------------
    | Validate Trainer Ownership
    |--------------------------------------------------------------------------
    */
    if (data.trainer) {
      const trainer = await Trainer.findOne({
        _id: data.trainer,
        gymOwner: ownerId
      });

      if (!trainer) {
        return res.status(400).json({
          message: "Invalid trainer"
        });
      }
    }

    let membershipPeriodFee = 0;

    /*
    |--------------------------------------------------------------------------
    | Create Member
    |--------------------------------------------------------------------------
    */
    const member = new Member({
      name,
      phone,
      ...data,

      // NEVER take gymOwner from frontend
      gymOwner: ownerId,

      joiningDate:
        parseDate(data.joiningDate) || new Date(),

      membershipStart:
        parseDate(data.membershipStart) || new Date()
    });

    /*
    |--------------------------------------------------------------------------
    | Validate Plan Ownership
    |--------------------------------------------------------------------------
    */
    if (planId) {
      const plan = await Plan.findOne({
        _id: planId,
        gymOwner: ownerId
      });

      if (!plan) {
        return res.status(400).json({
          message: "Invalid plan"
        });
      }

      member.currentPlan = plan._id;

      membershipPeriodFee =
        plan.price +
        (data.personalTraining
          ? plan.personalTrainingPrice
          : 0);

      const start =
        member.membershipStart || new Date();

      const end = new Date(start);

      end.setMonth(
        end.getMonth() + plan.durationMonths
      );

      member.membershipEnd = end;

      /*
      |--------------------------------------------------------------------------
      | Validate Personal Training Plan Ownership
      |--------------------------------------------------------------------------
      */
      if (personalTrainingPlanId) {
        const personalTrainingPlan =
          await PersonalTrainingPlan.findOne({
            _id: personalTrainingPlanId,
            gymOwner: ownerId
          });

        if (
          !personalTrainingPlan ||
          personalTrainingPlan.durationMonths !==
            plan.durationMonths
        ) {
          return res.status(400).json({
            message:
              "Personal training plan duration must match the membership plan"
          });
        }

        member.personalTraining = true;
        member.personalTrainingPlan =
          personalTrainingPlan._id;

        membershipPeriodFee =
          plan.price + personalTrainingPlan.price;
      }

      if (discountAmount > membershipPeriodFee) {
        return res.status(400).json({
          message: `Discount cannot be more than ₹${ membershipPeriodFee } `
        });
      }
    }

    /*
    |--------------------------------------------------------------------------
    | Financials
    |--------------------------------------------------------------------------
    */
    const discountedMembershipFee = Math.max(
      membershipPeriodFee - discountAmount,
      0
    );

    const paidAmount = Math.max(
      Number(paymentAmount) || 0,
      0
    );

    member.refreshStatus();

    member.financials = {
      totalFees: discountedMembershipFee,
      totalPaid: paidAmount,
      due: Math.max(
        discountedMembershipFee - paidAmount,
        0
      ),
      advance: Math.max(
        paidAmount - discountedMembershipFee,
        0
      )
    };

    await member.save();

    /*
    |--------------------------------------------------------------------------
    | CREATE PAYMENT
    |--------------------------------------------------------------------------
    */
    let payment;

    if (paidAmount > 0) {
      payment = await Payment.create({
        member: member._id,
        plan: member.currentPlan,
        amount: paidAmount,
        discount: discountAmount,
        method: paymentMethod || "Cash",
        transactionId,

        // IMPORTANT
        gymOwner: ownerId,

        membershipPeriodStart:
          member.membershipStart,

        membershipPeriodFee:
          discountedMembershipFee
      });

      payment = await payment.populate([
        {
          path: "member",
          select: "name phone"
        },
        {
          path: "plan",
          select: "name"
        }
      ]);
    }

    /*
    |--------------------------------------------------------------------------
    | Return Created Member
    |--------------------------------------------------------------------------
    */
    const populated = await Member.findOne({
      _id: member._id,
      gymOwner: ownerId
    })
      .populate("trainer")
      .populate("currentPlan")
      .populate("personalTrainingPlan");

    res.status(201).json({
      member: populated,
      payment
    });
  } catch (error) {
    console.error("createMember error:", error);

    res.status(500).json({
      message: "Failed to create member"
    });
  }
}

/*
|--------------------------------------------------------------------------
| UPDATE MEMBER
|--------------------------------------------------------------------------
*/
export async function updateMember(req, res) {
  try {
    const ownerId = req.user._id;

    const allowed = [
      "name",
      "phone",
      "gender",
      "address",
      "photo",
      "joiningDate",
      "timeSlot",
      "trainer",
      "personalTraining",
      "personalTrainingPlan",
      "notes",
      "status"
    ];

    const updates = {};

    allowed.forEach((key) => {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    });

    if (updates.trainer === "") {
      updates.trainer = null;
    }

    /*
    |--------------------------------------------------------------------------
    | Validate Trainer Ownership
    |--------------------------------------------------------------------------
    */
    if (updates.trainer) {
      const trainer = await Trainer.findOne({
        _id: updates.trainer,
        gymOwner: ownerId
      });

      if (!trainer) {
        return res.status(400).json({
          message: "Invalid trainer"
        });
      }
    }

    if (req.body.trainer !== undefined) {
      updates.personalTraining = Boolean(
        req.body.personalTraining ||
          updates.trainer
      );
    }

    if (updates.joiningDate) {
      updates.joiningDate =
        parseDate(updates.joiningDate);
    }

    /*
    |--------------------------------------------------------------------------
    | Validate Plan Ownership
    |--------------------------------------------------------------------------
    */
    if (req.body.planId !== undefined) {
      const plan = req.body.planId
        ? await Plan.findOne({
            _id: req.body.planId,
            gymOwner: ownerId
          })
        : null;

      if (req.body.planId && !plan) {
        return res.status(400).json({
          message: "Invalid plan"
        });
      }

      updates.currentPlan = plan?._id || null;
    }

    /*
    |--------------------------------------------------------------------------
    | Validate Personal Training Plan Ownership
    |--------------------------------------------------------------------------
    */
    if (req.body.personalTrainingPlanId !== undefined) {
      const personalTrainingPlan =
        req.body.personalTrainingPlanId
          ? await PersonalTrainingPlan.findOne({
              _id: req.body.personalTrainingPlanId,
              gymOwner: ownerId
            })
          : null;

      if (
        req.body.personalTrainingPlanId &&
        !personalTrainingPlan
      ) {
        return res.status(400).json({
          message: "Invalid personal training plan"
        });
      }

      updates.personalTrainingPlan =
        personalTrainingPlan?._id || null;

      updates.personalTraining =
        Boolean(personalTrainingPlan);
    }

    /*
    |--------------------------------------------------------------------------
    | Update Only Own Member
    |--------------------------------------------------------------------------
    */
    const member = await Member.findOneAndUpdate(
      {
        _id: req.params.id,
        gymOwner: ownerId
      },
      updates,
      {
        new: true,
        runValidators: true
      }
    )
      .populate("trainer")
      .populate("currentPlan")
      .populate("personalTrainingPlan");

    if (!member) {
      return res.status(404).json({
        message: "Member not found"
      });
    }

    res.json({
      member
    });
  } catch (error) {
    console.error("updateMember error:", error);

    res.status(500).json({
      message: "Failed to update member"
    });
  }
}

/*
|--------------------------------------------------------------------------
| DELETE MEMBER
|--------------------------------------------------------------------------
*/
export async function deleteMember(req, res) {
  try {
    const ownerId = req.user._id;

    /*
    |--------------------------------------------------------------------------
    | Delete only member belonging to logged-in gym
    |--------------------------------------------------------------------------
    */
    const member = await Member.findOneAndDelete({
      _id: req.params.id,
      gymOwner: ownerId
    });

    if (!member) {
      return res.status(404).json({
        message: "Member not found"
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Delete only this gym owner's payments
    |--------------------------------------------------------------------------
    */
    await Payment.deleteMany({
      member: member._id,
      gymOwner: ownerId
    });

    res.json({
      message: "Member deleted"
    });
  } catch (error) {
    console.error("deleteMember error:", error);

    res.status(500).json({
      message: "Failed to delete member"
    });
  }
}

/*
|--------------------------------------------------------------------------
| RENEW MEMBER
|--------------------------------------------------------------------------
*/
export async function renewMember(req, res) {
  try {
    const ownerId = req.user._id;

    const {
      planId,
      personalTrainingPlanId,
      amount,
      method,
      transactionId,
      startDate,
      note,
      personalTraining,
      discount
    } = req.body;

    /*
    |--------------------------------------------------------------------------
    | IMPORTANT:
    | Find member, DO NOT delete member
    |--------------------------------------------------------------------------
    */
    const member = await Member.findOne({
      _id: req.params.id,
      gymOwner: ownerId
    });

    if (!member) {
      return res.status(404).json({
        message: "Member not found"
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Validate Plan Ownership
    |--------------------------------------------------------------------------
    */
    const plan = await Plan.findOne({
      _id: planId,
      gymOwner: ownerId
    });

    if (!plan) {
      return res.status(400).json({
        message: "Invalid plan"
      });
    }

    const discountAmount = Math.max(
      Number(discount) || 0,
      0
    );

    /*
    |--------------------------------------------------------------------------
    | Validate Personal Training Plan Ownership
    |--------------------------------------------------------------------------
    */
    const personalTrainingPlan =
      personalTrainingPlanId
        ? await PersonalTrainingPlan.findOne({
            _id: personalTrainingPlanId,
            gymOwner: ownerId
          })
        : null;

    if (
      personalTrainingPlanId &&
      (
        !personalTrainingPlan ||
        personalTrainingPlan.durationMonths !==
          plan.durationMonths
      )
    ) {
      return res.status(400).json({
        message:
          "Personal training plan duration must match the membership plan"
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Calculate Membership Fee
    |--------------------------------------------------------------------------
    */
    const personalTrainingFee =
      personalTrainingPlan?.price ||
      (personalTraining
        ? plan.personalTrainingPrice
        : 0);

    const membershipPeriodFee =
      plan.price + personalTrainingFee;

    if (discountAmount > membershipPeriodFee) {
  return res.status(400).json({
    message: `Discount cannot be more than ₹${ membershipPeriodFee } `
  });
}

    const start =
      parseDate(startDate) ||
      (
        member.membershipEnd &&
        new Date(member.membershipEnd) > new Date()
          ? new Date(member.membershipEnd)
          : new Date()
      );

    const end = new Date(start);

    end.setMonth(
      end.getMonth() + plan.durationMonths
    );

    member.currentPlan = plan._id;

    member.personalTraining = Boolean(
      personalTrainingPlan ||
      personalTraining
    );

    member.personalTrainingPlan =
      personalTrainingPlan?._id || null;

    member.membershipStart = start;
    member.membershipEnd = end;

    /*
    |--------------------------------------------------------------------------
    | Financials
    |--------------------------------------------------------------------------
    */
    const discountedFee = Math.max(
      membershipPeriodFee - discountAmount,
      0
    );

    const renewalPayment = Math.max(
      Number(amount) || 0,
      0
    );

    if (member.financials) {
      const totalFees =
        Number(member.financials.totalFees || 0) +
        discountedFee;

      const totalPaid =
        Number(member.financials.totalPaid || 0) +
        renewalPayment;

      const balance =
        totalFees - totalPaid;

      member.financials = {
        totalFees,
        totalPaid,
        due: Math.max(balance, 0),
        advance: Math.max(-balance, 0)
      };
    } else {
      member.financials = {
        totalFees: discountedFee,
        totalPaid: renewalPayment,
        due: Math.max(
          discountedFee - renewalPayment,
          0
        ),
        advance: Math.max(
          renewalPayment - discountedFee,
          0
        )
      };
    }

    member.refreshStatus();

    await member.save();

    /*
    |--------------------------------------------------------------------------
    | CREATE RENEWAL PAYMENT
    |--------------------------------------------------------------------------
    */
    let payment;

    if (renewalPayment > 0) {
      const paymentData = {
        member: member._id,
        plan: plan._id,
        amount: renewalPayment,
        discount: discountAmount,
        method: method || "Cash",
        transactionId,
        note: note || "Membership renewal",

        // IMPORTANT
        gymOwner: ownerId,

        membershipPeriodStart: start,
        membershipPeriodFee: discountedFee
      };

      payment = await Payment.create(
        paymentData
      );

      payment = await payment.populate([
        {
          path: "member",
          select: "name phone"
        },
        {
          path: "plan",
          select: "name"
        }
      ]);
    }

    /*
    |--------------------------------------------------------------------------
    | Return Updated Member
    |--------------------------------------------------------------------------
    */
    const populated = await Member.findOne({
      _id: member._id,
      gymOwner: ownerId
    })
      .populate("trainer")
      .populate("currentPlan")
      .populate("personalTrainingPlan");

    res.json({
      member: populated,
      payment
    });
  } catch (error) {
    console.error("renewMember error:", error);

    res.status(500).json({
      message: "Failed to renew membership"
    });
  }
}