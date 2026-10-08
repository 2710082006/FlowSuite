const Plan = require("../models/Plan");
const Subscription = require("../models/Subscription");
// GET ALL ACTIVE PLANS
const getPlans = async (req, res) => {
  try {
    const plans = await Plan.find({
      isActive: true,
    }).sort({
      "price.monthly": 1,
    });

    return res.status(200).json({
      success: true,
      plans,
    });
  } catch (error) {
    console.error("Get plans error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch plans",
    });
  }
};

// GET CURRENT SUBSCRIPTION
const getCurrentSubscription = async (req, res) => {
  try {
    const workspaceId = req.user.workspaceId;

    if (!workspaceId) {
      return res.status(400).json({
        success: false,
        message: "Workspace information is missing",
      });
    }

    const subscription = await Subscription.findOne({
      workspace: workspaceId,
    }).populate("plan");

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "No subscription found",
      });
    }

    return res.status(200).json({
      success: true,
      subscription,
    });
  } catch (error) {
    console.error(
      "Get subscription error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch subscription",
    });
  }
};

// GET BILLING OVERVIEW
const getBillingOverview = async (req, res) => {
  try {
    const workspaceId = req.user.workspaceId;

    if (!workspaceId) {
      return res.status(400).json({
        success: false,
        message: "Workspace information is missing",
      });
    }

    const subscription = await Subscription.findOne({
      workspace: workspaceId,
    }).populate("plan");

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "No subscription found",
      });
    }

    const plan = subscription.plan;

    return res.status(200).json({
      success: true,

      billing: {
        subscriptionId: subscription._id,

        plan: {
          id: plan._id,
          name: plan.name,
          displayName: plan.displayName,
          description: plan.description,
          price: plan.price,
          features: plan.features,
        },

        status: subscription.status,
        billingCycle: subscription.billingCycle,

        startDate: subscription.startDate,
        renewalDate: subscription.renewalDate,

        cancelAtPeriodEnd:
          subscription.cancelAtPeriodEnd,

        cancelledAt: subscription.cancelledAt,
        trialEndsAt: subscription.trialEndsAt,

        paymentProvider:
          subscription.paymentProvider,
      },
    });
  } catch (error) {
    console.error(
      "Billing overview error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch billing overview",
    });
  }
};
const changePlan = async (req, res) => {
  try {
    const workspaceId = req.user.workspaceId;
    const { planId, billingCycle = "monthly" } = req.body;

    if (!workspaceId) {
      return res.status(400).json({
        success: false,
        message: "Workspace information is missing",
      });
    }

    if (!planId) {
      return res.status(400).json({
        success: false,
        message: "Plan ID is required",
      });
    }

    if (!["monthly", "yearly"].includes(billingCycle)) {
      return res.status(400).json({
        success: false,
        message: "Invalid billing cycle",
      });
    }

    const plan = await Plan.findOne({
      _id: planId,
      isActive: true,
    });

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: "Plan not found",
      });
    }

    const subscription = await Subscription.findOne({
      workspace: workspaceId,
    });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "No subscription found",
      });
    }

    if (subscription.plan.toString() === plan._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "You are already subscribed to this plan",
      });
    }

    const now = new Date();

    subscription.plan = plan._id;
    subscription.billingCycle = billingCycle;
    subscription.status = "active";
    subscription.startDate = now;
    subscription.renewalDate = new Date(
      now.getTime() +
        (billingCycle === "yearly" ? 365 : 30) *
          24 *
          60 *
          60 *
          1000
    );
    subscription.cancelAtPeriodEnd = false;
    subscription.cancelledAt = null;
    subscription.trialEndsAt = null;

    await subscription.save();

    const updatedSubscription =
      await Subscription.findById(
        subscription._id
      ).populate("plan");

    return res.status(200).json({
      success: true,
      message: "Subscription plan updated successfully",
      subscription: updatedSubscription,
    });
  } catch (error) {
    console.error(
      "Change plan error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to change subscription plan",
    });
  }
};
const cancelSubscription = async (req, res) => {
  try {
    const workspaceId = req.user.workspaceId;

    if (!workspaceId) {
      return res.status(400).json({
        success: false,
        message: "Workspace information is missing",
      });
    }

    const subscription = await Subscription.findOne({
      workspace: workspaceId,
    }).populate("plan");

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "No subscription found",
      });
    }

    if (subscription.status !== "active") {
      return res.status(400).json({
        success: false,
        message: "Only active subscriptions can be cancelled",
      });
    }

    if (subscription.cancelAtPeriodEnd) {
      return res.status(400).json({
        success: false,
        message: "Subscription is already scheduled for cancellation",
      });
    }

    subscription.cancelAtPeriodEnd = true;
    subscription.cancelledAt = new Date();

    await subscription.save();

    return res.status(200).json({
      success: true,
      message:
        "Subscription cancellation scheduled successfully",
      subscription,
    });
  } catch (error) {
    console.error(
      "Cancel subscription error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to cancel subscription",
    });
  }
};
const reactivateSubscription = async (req, res) => {
  try {
    const workspaceId = req.user.workspaceId;

    if (!workspaceId) {
      return res.status(400).json({
        success: false,
        message: "Workspace information is missing",
      });
    }

    const subscription = await Subscription.findOne({
      workspace: workspaceId,
    }).populate("plan");

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "No subscription found",
      });
    }

    if (!subscription.cancelAtPeriodEnd) {
      return res.status(400).json({
        success: false,
        message: "Subscription is not scheduled for cancellation",
      });
    }

    subscription.cancelAtPeriodEnd = false;
    subscription.cancelledAt = null;

    await subscription.save();

    return res.status(200).json({
      success: true,
      message: "Subscription reactivated successfully",
      subscription,
    });
  } catch (error) {
    console.error(
      "Reactivate subscription error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to reactivate subscription",
    });
  }
};
module.exports = {
  getPlans,
  getCurrentSubscription,
  getBillingOverview,
  changePlan,
  cancelSubscription,
  reactivateSubscription,
};