const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    company: {
      type: String,
      trim: true,
      maxlength: 150,
      default: "",
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
      maxlength: 150,
      default: "",
    },

    phone: {
      type: String,
      trim: true,
      maxlength: 30,
      default: "",
    },

    address: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },

    industry: {
      type: String,
      trim: true,
      maxlength: 100,
      default: "",
    },

    status: {
      type: String,
      enum: [
        "lead",
        "active",
        "inactive",
      ],
      default: "lead",
      index: true,
    },

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    notes: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: "",
    },

    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
      index: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Useful for multi-tenant customer queries
customerSchema.index({
  workspace: 1,
  status: 1,
});

customerSchema.index({
  workspace: 1,
  createdAt: -1,
});

module.exports = mongoose.model(
  "Customer",
  customerSchema
);