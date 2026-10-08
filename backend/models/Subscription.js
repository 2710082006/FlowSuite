const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema(
  {
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
      unique: true,
      index: true,
    },

    plan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Plan",
      required: true,
    },

    status: {
      type: String,
      enum: [
        "trialing",
        "active",
        "past_due",
        "cancelled",
        "expired",
      ],
      default: "active",
    },

    billingCycle: {
      type: String,
      enum: ["monthly", "yearly"],
      default: "monthly",
    },

    startDate: {
      type: Date,
      default: Date.now,
    },

    renewalDate: {
      type: Date,
      default: null,
    },

    cancelAtPeriodEnd: {
      type: Boolean,
      default: false,
    },

    cancelledAt: {
      type: Date,
      default: null,
    },

    trialEndsAt: {
      type: Date,
      default: null,
    },

    paymentProvider: {
      type: String,
      enum: ["none", "stripe"],
      default: "none",
    },

    externalSubscriptionId: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Subscription",
  subscriptionSchema
);