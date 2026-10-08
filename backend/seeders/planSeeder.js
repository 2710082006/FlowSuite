const mongoose = require("mongoose");
const dotenv = require("dotenv");

const Plan = require("../models/Plan");

dotenv.config();

const plans = [
  {
    name: "free",
    displayName: "Free",
    description: "For individuals getting started with FlowSuite.",
    price: {
      monthly: 0,
      yearly: 0,
    },
    features: {
      maxProjects: 3,
      maxMembers: 5,
      maxCustomers: 50,
      maxStorageMB: 500,
      advancedAnalytics: false,
      auditLogs: false,
      customRoles: false,
      apiAccess: false,
      prioritySupport: false,
    },
  },

  {
    name: "pro",
    displayName: "Pro",
    description: "For growing teams that need more power.",
    price: {
      monthly: 999,
      yearly: 9990,
    },
    features: {
      maxProjects: 25,
      maxMembers: 25,
      maxCustomers: 500,
      maxStorageMB: 5000,
      advancedAnalytics: true,
      auditLogs: true,
      customRoles: false,
      apiAccess: true,
      prioritySupport: false,
    },
  },

  {
    name: "business",
    displayName: "Business",
    description: "For established teams managing complex operations.",
    price: {
      monthly: 2499,
      yearly: 24990,
    },
    features: {
      maxProjects: 100,
      maxMembers: 100,
      maxCustomers: 5000,
      maxStorageMB: 25000,
      advancedAnalytics: true,
      auditLogs: true,
      customRoles: true,
      apiAccess: true,
      prioritySupport: true,
    },
  },

  {
    name: "enterprise",
    displayName: "Enterprise",
    description: "Unlimited scale with advanced enterprise capabilities.",
    price: {
      monthly: 0,
      yearly: 0,
    },
    features: {
      maxProjects: -1,
      maxMembers: -1,
      maxCustomers: -1,
      maxStorageMB: -1,
      advancedAnalytics: true,
      auditLogs: true,
      customRoles: true,
      apiAccess: true,
      prioritySupport: true,
    },
  },
];

const seedPlans = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected");

    for (const plan of plans) {
      await Plan.findOneAndUpdate(
        { name: plan.name },
        plan,
        {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true,
        }
      );

      console.log(`${plan.displayName} plan seeded`);
    }

    console.log("All plans seeded successfully");

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("Plan seeding error:", error);

    await mongoose.connection.close();
    process.exit(1);
  }
};

seedPlans();