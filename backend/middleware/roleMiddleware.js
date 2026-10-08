const WorkspaceMember = require("../models/WorkspaceMember");

const requireRole = (...allowedRoles) => {
  return async (req, res, next) => {
    try {
      if (!req.user?.id || !req.user?.workspaceId) {
        return res.status(401).json({
          success: false,
          message: "Authentication required",
        });
      }

      const membership = await WorkspaceMember.findOne({
        workspace: req.user.workspaceId,
        user: req.user.id,
        status: "active",
      });

      if (!membership) {
        return res.status(403).json({
          success: false,
          message: "You are not an active member of this workspace",
        });
      }

      if (!allowedRoles.includes(membership.role)) {
        return res.status(403).json({
          success: false,
          message: "You do not have permission to perform this action",
        });
      }

      // Fresh role — JWT ke stale role par depend nahi karenge
      req.user.role = membership.role;
      req.user.membershipId = membership._id;

      next();
    } catch (error) {
      console.error("Role middleware error:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to verify workspace permissions",
      });
    }
  };
};

module.exports = requireRole;