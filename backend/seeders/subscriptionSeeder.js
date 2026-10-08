const mongoose = require("mongoose");
const dotenv = require("dotenv");

const Plan = require("../models/Plan");
const Workspace = require("../models/Workspace");
const Subscription = require("../models/Subscription");

dotenv.config();

const seedSubscriptions = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected");

    const freePlan = await Plan.findOne({
      name: "free",
      isActive: true,
    });

    if (!freePlan) {
      throw new Error(
        "Free plan not found. Run npm run seed:plans first."
      );
    }

    const workspaces = await Workspace.find();

    console.log(
      `Found ${workspaces.length} workspace(s)`
    );

    for (const workspace of workspaces) {
      const existingSubscription =
        await Subscription.findOne({
          workspace: workspace._id,
        });

      if (existingSubscription) {
        console.log(
          `Subscription already exists for workspace: ${workspace.name}`
        );

        continue;
      }

      await Subscription.create({
        workspace: workspace._id,
        plan: freePlan._id,
        status: "active",
        billingCycle: "monthly",
        startDate: new Date(),
        renewalDate: null,
        cancelAtPeriodEnd: false,
        paymentProvider: "none",
      });

      console.log(
        `Free subscription created for: ${workspace.name}`
      );
    }

    console.log(
      "All workspace subscriptions seeded successfully"
    );

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error(
      "Subscription seeding error:",
      error
    );

    await mongoose.connection.close();
    process.exit(1);
  }
};

seedSubscriptions();