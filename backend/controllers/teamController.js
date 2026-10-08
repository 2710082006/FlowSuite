const bcrypt = require("bcryptjs");

const WorkspaceMember = require("../models/WorkspaceMember");
const User = require("../models/User");

const { createAuditLog } = require("../services/auditService");
const {
  createNotification,
} = require("../services/notificationService");

const getTeamMembers = async (req, res) => {
  try {
    const workspaceId = req.user.workspaceId;

    if (!workspaceId) {
      return res.status(400).json({
        success: false,
        message: "User is not associated with a workspace",
      });
    }

    const members = await WorkspaceMember.find({
      workspace: workspaceId,
    })
      .populate(
        "user",
        "name email avatar status createdAt"
      )
      .sort({ createdAt: 1 });

    return res.json({
      success: true,
      members,
    });
  } catch (error) {
    console.error(
      "Get team members error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch team members",
    });
  }
};

const addTeamMember = async (req, res) => {
  try {
    const workspaceId = req.user.workspaceId;

    const {
      name,
      email,
      password,
      role = "member",
    } = req.body;

    if (!workspaceId) {
      return res.status(400).json({
        success: false,
        message: "User is not associated with a workspace",
      });
    }

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message:
          "Name, email and password are required",
      });
    }

    if (
      req.user.role !== "owner" &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Only owners and admins can add members",
      });
    }

    if (
      role === "owner" &&
      req.user.role !== "owner"
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Only the workspace owner can assign owner role",
      });
    }

    const allowedRoles = [
      "owner",
      "admin",
      "manager",
      "member",
    ];

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role",
      });
    }

    const normalizedEmail =
      email.toLowerCase().trim();

    let user = await User.findOne({
      email: normalizedEmail,
    });

    if (user) {
      const existingMembership =
        await WorkspaceMember.findOne({
          workspace: workspaceId,
          user: user._id,
        });

      if (existingMembership) {
        return res.status(409).json({
          success: false,
          message:
            "User is already a member of this workspace",
        });
      }
    }

    if (!user) {
      const hashedPassword =
        await bcrypt.hash(password, 10);

      user = await User.create({
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        role,
        workspace: workspaceId,
      });
    }

    const membership =
      await WorkspaceMember.create({
        workspace: workspaceId,
        user: user._id,
        role,
        status: "active",
      });

    await createNotification({
      workspaceId,
      recipientId: user._id,
      type: "team_member_added",
      title: "Welcome to FlowSuite",
      message: `You have been added to the workspace with the ${role} role.`,
      entityType: "WorkspaceMember",
      entityId: membership._id,
      metadata: {
        memberId: membership._id,
        role,
      },
    });

    await createAuditLog({
      workspaceId,
      userId: req.user.id,
      action: "created",
      entityType: "WorkspaceMember",
      entityId: membership._id,
      description: `Team member "${user.name}" was added to the workspace`,
      metadata: {
        userId: user._id,
        email: user.email,
        role,
      },
      req,
    });

    const populatedMembership =
      await WorkspaceMember.findById(
        membership._id
      ).populate(
        "user",
        "name email avatar status createdAt"
      );

    return res.status(201).json({
      success: true,
      message: "Team member added successfully",
      member: populatedMembership,
    });
  } catch (error) {
    console.error(
      "Add team member error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to add team member",
    });
  }
};

const updateMemberRole = async (req, res) => {
  try {
    const workspaceId = req.user.workspaceId;
    const { id } = req.params;
    const { role } = req.body;

    if (!workspaceId) {
      return res.status(400).json({
        success: false,
        message: "Workspace not found",
      });
    }

    if (
      req.user.role !== "owner" &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Only owners and admins can update roles",
      });
    }

    const allowedRoles = [
      "owner",
      "admin",
      "manager",
      "member",
    ];

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role",
      });
    }

    const membership = await WorkspaceMember.findOne({
      _id: id,
      workspace: workspaceId,
      status: "active",
    });

    if (!membership) {
      return res.status(404).json({
        success: false,
        message: "Team member not found",
      });
    }

    const targetUserId = membership.user.toString();

    if (
      membership.role === "owner" &&
      targetUserId !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: "Workspace owner's role cannot be changed",
      });
    }

    if (
      targetUserId === req.user.id &&
      membership.role === "owner" &&
      role !== "owner"
    ) {
      return res.status(403).json({
        success: false,
        message: "Workspace owner cannot demote themselves",
      });
    }

    if (
      req.user.role === "admin" &&
      ["owner", "admin"].includes(role)
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Admins can only assign manager or member roles",
      });
    }

    if (
      req.user.role === "admin" &&
      membership.role === "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Admins cannot modify another admin",
      });
    }

    if (
      role === "owner" &&
      req.user.role !== "owner"
    ) {
      return res.status(403).json({
        success: false,
        message: "Only the workspace owner can assign owner role",
      });
    }

    const previousRole = membership.role;

    if (previousRole === role) {
      return res.json({
        success: true,
        message: "Member role is already set to this role",
      });
    }

    membership.role = role;

    await membership.save();

    await User.findByIdAndUpdate(
      membership.user,
      {
        role,
      },
      {
        new: true,
      }
    );

    await createNotification({
      workspaceId,
      recipientId: membership.user,
      type: "system",
      title: "Your role has been updated",
      message: `Your workspace role has changed from ${previousRole} to ${role}.`,
      entityType: "WorkspaceMember",
      entityId: membership._id,
      metadata: {
        memberId: membership._id,
        previousRole,
        newRole: role,
      },
    });

    await createAuditLog({
      workspaceId,
      userId: req.user.id,
      action: "updated",
      entityType: "WorkspaceMember",
      entityId: membership._id,
      description: `Team member role changed from ${previousRole} to ${role}`,
      metadata: {
        userId: membership.user,
        previousRole,
        newRole: role,
      },
      req,
    });

    const updatedMembership =
      await WorkspaceMember.findById(
        membership._id
      ).populate(
        "user",
        "name email avatar status createdAt"
      );

    return res.json({
      success: true,
      message: "Member role updated successfully",
      member: updatedMembership,
    });
  } catch (error) {
    console.error(
      "Update member role error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to update member role",
    });
  }
};

const removeTeamMember = async (req, res) => {
  try {
    const workspaceId = req.user.workspaceId;
    const { id } = req.params;

    if (!workspaceId) {
      return res.status(400).json({
        success: false,
        message: "Workspace not found",
      });
    }

    if (
      req.user.role !== "owner" &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Only owners and admins can remove members",
      });
    }

    const membership =
      await WorkspaceMember.findOne({
        _id: id,
        workspace: workspaceId,
      }).populate(
        "user",
        "name email"
      );

    if (!membership) {
      return res.status(404).json({
        success: false,
        message: "Team member not found",
      });
    }

    if (membership.role === "owner") {
      return res.status(403).json({
        success: false,
        message:
          "Workspace owner cannot be removed",
      });
    }
if (
  req.user.role === "admin" &&
  membership.role === "admin"
) {
  return res.status(403).json({
    success: false,
    message: "Admins cannot remove another admin",
  });
}
    const removedUserId = membership.user._id;
    const removedUserName = membership.user.name;
    const removedUserEmail = membership.user.email;
    const removedMemberId = membership._id;
    const removedRole = membership.role;

    await WorkspaceMember.deleteOne({
      _id: membership._id,
       workspace: workspaceId,
    });

    await createAuditLog({
      workspaceId,
      userId: req.user.id,
      action: "deleted",
      entityType: "WorkspaceMember",
      entityId: removedMemberId,
      description: `Team member "${removedUserName}" was removed from the workspace`,
      metadata: {
        userId: removedUserId,
        email: removedUserEmail,
        role: removedRole,
      },
      req,
    });

    return res.json({
      success: true,
      message: "Team member removed successfully",
    });
  } catch (error) {
    console.error(
      "Remove team member error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to remove team member",
    });
  }
};

module.exports = {
  getTeamMembers,
  addTeamMember,
  updateMemberRole,
  removeTeamMember,
};