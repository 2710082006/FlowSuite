const mongoose = require("mongoose");

const workspaceMemberSchema = new mongoose.Schema(
  {
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
      index: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    role: {
      type: String,
      enum: [
        "owner",
        "admin",
        "manager",
        "member",
      ],
      default: "member",
    },

    status: {
      type: String,
      enum: [
        "active",
        "suspended",
      ],
      default: "active",
    },

    joinedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

workspaceMemberSchema.index(
  { workspace: 1, user: 1 },
  { unique: true }
);

module.exports = mongoose.model(
  "WorkspaceMember",
  workspaceMemberSchema
);