const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
      index: true,
    },

    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    type: {
      type: String,
      enum: [
        "task_assigned",
        "task_status_changed",
        "task_due",
        "task_overdue",
        "team_member_added",
        "system",
      ],
      default: "system",
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    message: {
      type: String,
      required: true,
      trim: true,
    },

    entityType: {
      type: String,
      default: "",
      trim: true,
    },

    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },

    notificationKey: {
      type: String,
      default: "",
      index: true,
    },

    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },

    readAt: {
      type: Date,
      default: null,
    },

    scheduledFor: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

notificationSchema.index({
  recipient: 1,
  isRead: 1,
  createdAt: -1,
});

notificationSchema.index({
  workspace: 1,
  recipient: 1,
  createdAt: -1,
});

notificationSchema.index({
  workspace: 1,
  recipient: 1,
  notificationKey: 1,
});

const Notification = mongoose.model(
  "Notification",
  notificationSchema
);

module.exports = Notification;