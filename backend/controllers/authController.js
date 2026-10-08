const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const mongoose = require("mongoose");

const Workspace = require("../models/Workspace");
const User = require("../models/User");
const WorkspaceMember = require("../models/WorkspaceMember");
const Subscription = require("../models/Subscription");
const Plan = require("../models/Plan");
const generateToken = (user, workspaceRole) => {
  return jwt.sign(
    {
      id: user._id,
      workspaceId: user.workspace,
      role: workspaceRole || user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
};

const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const isBooleanValue = (value) => {
  return typeof value === "boolean";
};

const register = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    const name = req.body.name?.trim();
    const email = req.body.email?.trim().toLowerCase();
    const password = req.body.password;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required",
      });
    }

    if (name.length < 2) {
      return res.status(400).json({
        success: false,
        message: "Name must be at least 2 characters long",
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long",
      });
    }

    const existingUser = await User.findOne({
      email,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists",
      });
    }

    const freePlan = await Plan.findOne({
      name: "free",
      isActive: true,
    }).session(session);

    if (!freePlan) {
      return res.status(500).json({
        success: false,
        message: "Free plan is not configured",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    let createdUser;
    let createdWorkspace;

    await session.withTransaction(async () => {
      const users = await User.create(
        [
          {
            name,
            email,
            password: hashedPassword,
            role: "owner",
            status: "active",
          },
        ],
        { session }
      );

      createdUser = users[0];

      const workspaceSlug = `${name}-${createdUser._id}`
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

      const workspaces = await Workspace.create(
        [
          {
            name: `${name}'s Workspace`,
            slug: workspaceSlug,
            owner: createdUser._id,
            plan: "free",
            status: "active",
          },
        ],
        { session }
      );

      createdWorkspace = workspaces[0];

      createdUser.workspace = createdWorkspace._id;

      await createdUser.save({ session });

      await WorkspaceMember.create(
        [
          {
            workspace: createdWorkspace._id,
            user: createdUser._id,
            role: "owner",
            status: "active",
          },
        ],
        { session }
      );

      await Subscription.create(
        [
          {
            workspace: createdWorkspace._id,
            plan: freePlan._id,
            status: "active",
            billingCycle: "monthly",
            startDate: new Date(),
            renewalDate: new Date(
              Date.now() + 30 * 24 * 60 * 60 * 1000
            ),
            cancelAtPeriodEnd: false,
            paymentProvider: "none",
          },
        ],
        { session }
      );
    });

    const token = generateToken(createdUser, "owner");

    return res.status(201).json({
      success: true,
      message: "Account created successfully",
      token,
      user: {
        id: createdUser._id,
        name: createdUser.name,
        email: createdUser.email,
        role: "owner",
        workspaceId: createdWorkspace._id,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Registration failed",
    });
  } finally {
    await session.endSession();
  }
};

const login = async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase();
    const password = req.body.password;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address",
      });
    }

    const user = await User.findOne({
      email,
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (user.status !== "active") {
      return res.status(403).json({
        success: false,
        message: "Your account is not active",
      });
    }

    const passwordMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (!user.workspace) {
      return res.status(403).json({
        success: false,
        message:
          "Your account is not associated with a workspace",
      });
    }

    const membership = await WorkspaceMember.findOne({
      workspace: user.workspace,
      user: user._id,
      status: "active",
    });

    if (!membership) {
      return res.status(403).json({
        success: false,
        message:
          "Your workspace membership is missing or inactive",
      });
    }

    const workspaceRole = membership.role;

    if (!workspaceRole) {
      return res.status(403).json({
        success: false,
        message: "Your workspace role is not configured",
      });
    }

    if (user.role !== workspaceRole) {
      user.role = workspaceRole;
      await user.save();
    }

    const token = generateToken(
      user,
      workspaceRole
    );

    return res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: workspaceRole,
        workspaceId: user.workspace,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      success: false,
      message: "Login failed",
    });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select("-password")
      .populate(
        "workspace",
        "name slug status plan"
      );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Get profile error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load profile",
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const name = req.body.name?.trim();
    const email = req.body.email?.trim().toLowerCase();

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Name is required",
      });
    }

    if (name.length < 2) {
      return res.status(400).json({
        success: false,
        message: "Name must be at least 2 characters long",
      });
    }

    if (email && !isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address",
      });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (email && email !== user.email) {
      const existingUser = await User.findOne({
        email,
        _id: { $ne: user._id },
      });

      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: "This email is already in use",
        });
      }

      user.email = email;
    }

    user.name = name;

    await user.save();

    const updatedUser = await User.findById(
      user._id
    )
      .select("-password")
      .populate(
        "workspace",
        "name slug status plan"
      );

    return res.json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Update profile error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "This email is already in use",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to update profile",
    });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase();

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address",
      });
    }

    const user = await User.findOne({
      email,
      status: "active",
    });

    if (!user) {
      return res.json({
        success: true,
        message:
          "If an account with this email exists, a password reset link has been generated",
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");

    const hashedResetToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetPasswordToken = hashedResetToken;

    user.resetPasswordExpires =
      new Date(Date.now() + 15 * 60 * 1000);

    await user.save();

    const resetUrl =
      `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    console.log("Password reset URL:", resetUrl);

    return res.json({
      success: true,
      message:
        "If an account with this email exists, a password reset link has been generated",
    });
  } catch (error) {
    console.error(
      "Forgot password error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to process password reset request",
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Reset token is required",
      });
    }

    if (!newPassword) {
      return res.status(400).json({
        success: false,
        message: "New password is required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters long",
      });
    }

    const hashedResetToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedResetToken,
      resetPasswordExpires: {
        $gt: new Date(),
      },
      status: "active",
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token",
      });
    }

    user.password = await bcrypt.hash(newPassword, 12);

    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;

    await user.save();

    return res.json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error(
      "Reset password error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to reset password",
    });
  }
};

const changePassword = async (req, res) => {
  try {
    const {
      currentPassword,
      newPassword,
    } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message:
          "Current password and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message:
          "New password must be at least 6 characters long",
      });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({
        success: false,
        message:
          "New password must be different from current password",
      });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    user.password = await bcrypt.hash(
      newPassword,
      12
    );

    await user.save();

    return res.json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error(
      "Change password error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to change password",
    });
  }
};

const getPreferences = async (req, res) => {
  try {
    const user = await User.findById(
      req.user.id
    ).select("preferences");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.json({
      success: true,
      preferences: user.preferences,
    });
  } catch (error) {
    console.error(
      "Get preferences error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to load preferences",
    });
  }
};

const updatePreferences = async (req, res) => {
  try {
    const {
      theme,
      emailNotifications,
      taskNotifications,
      teamNotifications,
      systemNotifications,
    } = req.body;

    const user = await User.findById(
      req.user.id
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (
      theme !== undefined &&
      !["light", "dark", "system"].includes(theme)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid theme preference",
      });
    }

    const booleanPreferences = [
      {
        key: "emailNotifications",
        value: emailNotifications,
      },
      {
        key: "taskNotifications",
        value: taskNotifications,
      },
      {
        key: "teamNotifications",
        value: teamNotifications,
      },
      {
        key: "systemNotifications",
        value: systemNotifications,
      },
    ];

    for (const preference of booleanPreferences) {
      if (
        preference.value !== undefined &&
        !isBooleanValue(preference.value)
      ) {
        return res.status(400).json({
          success: false,
          message:
            `${preference.key} must be a boolean`,
        });
      }
    }

    if (theme !== undefined) {
      user.preferences.theme = theme;
    }

    if (emailNotifications !== undefined) {
      user.preferences.emailNotifications =
        emailNotifications;
    }

    if (taskNotifications !== undefined) {
      user.preferences.taskNotifications =
        taskNotifications;
    }

    if (teamNotifications !== undefined) {
      user.preferences.teamNotifications =
        teamNotifications;
    }

    if (systemNotifications !== undefined) {
      user.preferences.systemNotifications =
        systemNotifications;
    }

    await user.save();

    return res.json({
      success: true,
      message: "Preferences updated successfully",
      preferences: user.preferences,
    });
  } catch (error) {
    console.error(
      "Update preferences error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to update preferences",
    });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  forgotPassword,
  resetPassword,
  changePassword,
  getPreferences,
  updatePreferences,
};