const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
    },

    role: {
      type: String,
      enum: ["owner", "admin", "manager", "member"],
      default: "owner",
    },

    status: {
      type: String,
      enum: ["active", "suspended"],
      default: "active",
    },

    avatar: {
      type: String,
      default: "",
    },
resetPasswordToken: {
  type: String,
  default: null,
  index: true,
},

resetPasswordExpires: {
  type: Date,
  default: null,
},
    preferences: {
  theme: {
    type: String,
    enum: ["light", "dark", "system"],
    default: "light",
  },
  emailNotifications: {
    type: Boolean,
    default: true,
  },
  taskNotifications: {
    type: Boolean,
    default: true,
  },
  teamNotifications: {
    type: Boolean,
    default: true,
  },
  systemNotifications: {
    type: Boolean,
    default: true,
  },
},
    workspace: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "Workspace",
  default: null,
},
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);