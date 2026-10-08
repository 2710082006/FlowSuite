const mongoose = require("mongoose");

const planSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      enum: ["free", "pro", "business", "enterprise"],
    },

    displayName: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    price: {
      monthly: {
        type: Number,
        default: 0,
        min: 0,
      },

      yearly: {
        type: Number,
        default: 0,
        min: 0,
      },
    },

    features: {
      maxProjects: {
        type: Number,
        default: 3,
      },

      maxMembers: {
        type: Number,
        default: 5,
      },

      maxCustomers: {
        type: Number,
        default: 50,
      },

      maxStorageMB: {
        type: Number,
        default: 500,
      },

      advancedAnalytics: {
        type: Boolean,
        default: false,
      },

      auditLogs: {
        type: Boolean,
        default: false,
      },

      customRoles: {
        type: Boolean,
        default: false,
      },

      apiAccess: {
        type: Boolean,
        default: false,
      },

      prioritySupport: {
        type: Boolean,
        default: false,
      },
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Plan", planSchema);