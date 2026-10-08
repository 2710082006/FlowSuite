const mongoose = require("mongoose");
const dotenv = require("dotenv");

const Workspace = require("../models/Workspace");
const Plan = require("../models/Plan");
const Subscription = require("../models/Subscription");

dotenv.config();

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const workspace = await Workspace.findOne();

    if (!workspace) {
      console.log("No workspace found");
      process.exit(1);
    }

    const proPlan = await Plan.findOne({
      name: "pro",
    });

    if (!proPlan) {
      console.log("Pro plan not found");
      process.exit(1);
    }

    const subscription =
      await Subscription.findOneAndUpdate(
        { workspace: workspace._id },
        {
          plan: proPlan._id,
          status: "active",
          billingCycle: "monthly",
        },
        { new: true }
      ).populate("plan");

    console.log("WORKSPACE:", workspace._id);
    console.log("CURRENT PLAN:", subscription.plan.name);
    console.log(
      "AUDIT LOGS:",
      subscription.plan.features.auditLogs
    );

    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

run();