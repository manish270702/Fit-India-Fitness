import Payment from "../models/Payment.js";
import Member from "../models/Member.js";
import Plan from "../models/Plan.js";

export async function listPayments(req, res) {
  try {
    const { search = "", method = "All" } = req.query;
    const ownerId = req.user._id;

    const filter = {
      gymOwner: ownerId
    };

    if (method !== "All") {
      filter.method = method;
    }

    let payments = await Payment.find(filter)
      .populate("member", "name phone")
      .populate("plan", "name price")
      .sort({ paymentDate: -1 });

    if (search) {
      const searchText = search.toLowerCase();

      payments = payments.filter(
        (p) =>
          p.member?.name?.toLowerCase().includes(searchText) ||
          p.member?.phone?.includes(search)
      );
    }

    res.json({ payments });
  } catch (error) {
    console.error("List payments error:", error);
    res.status(500).json({
      message: "Failed to fetch payments",
      error: error.message
    });
  }
}

export async function createPayment(req, res) {
  try {
    const {
      member,
      amount,
      method,
      plan,
      transactionId,
      paymentDate,
      note,
      discount
    } = req.body;

    const ownerId = req.user._id;

    // Basic validation
    if (!member || amount === undefined || !method) {
      return res.status(400).json({
        message: "Member, amount and method are required"
      });
    }

    const paymentAmount = Number(amount);

    if (!Number.isFinite(paymentAmount) || paymentAmount <= 0) {
      return res.status(400).json({
        message: "Payment amount must be greater than 0"
      });
    }

    const discountAmount = Math.max(Number(discount) || 0, 0);

    // Get member ONLY from current gym
    const memberRecord = await Member.findOne({
      _id: member,
      gymOwner: ownerId
    })
      .select(
        "membershipStart currentPlan personalTraining personalTrainingPlan financials gymOwner"
      )
      .populate("currentPlan", "price personalTrainingPrice")
      .populate("personalTrainingPlan", "price");

    if (!memberRecord) {
      return res.status(404).json({
        message: "Member not found"
      });
    }

    // Make sure selected plan belongs to the same gym
    let selectedPlan = null;

    if (plan) {
      selectedPlan = await Plan.findOne({
        _id: plan,
        gymOwner: ownerId
      }).select("price personalTrainingPrice");

      if (!selectedPlan) {
        return res.status(400).json({
          message: "Invalid plan"
        });
      }
    } else if (memberRecord.currentPlan) {
      selectedPlan = await Plan.findOne({
        _id: memberRecord.currentPlan._id,
        gymOwner: ownerId
      }).select("price personalTrainingPrice");
    }

    // Calculate membership fee
    const planPrice = Number(selectedPlan?.price || 0);

    const personalTrainingFee = memberRecord.personalTraining
      ? Number(
        memberRecord.personalTrainingPlan?.price ??
        selectedPlan?.personalTrainingPrice ??
        0
      )
      : 0;

    const planTotal = planPrice + personalTrainingFee;

    // Discount cannot be greater than membership fee
    if (discountAmount > planTotal) {
      return res.status(400).json({
        message: `Discount cannot be more than ₹${planTotal}`
      });
    }

    const paymentData = {
      member: memberRecord._id,
      amount: paymentAmount,
      discount: discountAmount,
      method,
      plan: selectedPlan?._id || null,
      transactionId,
      paymentDate: paymentDate || new Date(),
      note,
      gymOwner: ownerId
    };

    // For old members without financials,
    // store membership period information
    if (!memberRecord.financials) {
      paymentData.membershipPeriodStart =
        memberRecord.membershipStart || new Date();

      paymentData.membershipPeriodFee = planTotal;
    }

    const payment = await Payment.create(paymentData);

    // Update member financials
    if (memberRecord.financials) {
      const oldTotalFees = Number(
        memberRecord.financials.totalFees || 0
      );

      const oldTotalPaid = Number(
        memberRecord.financials.totalPaid || 0
      );

      // Discount is applied to fees
      const totalFees = Math.max(
        oldTotalFees - discountAmount,
        0
      );

      const totalPaid = oldTotalPaid + paymentAmount;

      const balance = totalFees - totalPaid;

      await Member.findOneAndUpdate(
        {
          _id: memberRecord._id,
          gymOwner: ownerId
        },
        {
          financials: {
            totalFees,
            totalPaid,
            due: Math.max(balance, 0),
            advance: Math.max(-balance, 0)
          }
        }
      );
    }

    const populatedPayment = await payment.populate([
      {
        path: "member",
        select: "name phone"
      },
      {
        path: "plan",
        select: "name price"
      }
    ]);

    res.status(201).json({
      payment: populatedPayment
    });
  } catch (error) {
    console.error("Create payment error:", error);

    res.status(500).json({
      message: "Failed to create payment",
      error: error.message
    });
  }
}

export async function memberPayments(req, res) {
  try {
    const ownerId = req.user._id;

    // First make sure the member belongs to this gym
    const member = await Member.findOne({
      _id: req.params.memberId,
      gymOwner: ownerId
    }).select("_id");

    if (!member) {
      return res.status(404).json({
        message: "Member not found"
      });
    }

    const payments = await Payment.find({
      member: member._id,
      gymOwner: ownerId
    })
      .populate("plan", "name price")
      .sort({ paymentDate: -1 });

    res.json({
      payments
    });
  } catch (error) {
    console.error("Member payments error:", error);

    res.status(500).json({
      message: "Failed to fetch member payments",
      error: error.message
    });
  }
}