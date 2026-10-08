const AuditLog = require("../models/AuditLog");

const createAuditLog = async ({
  workspaceId,
  userId = null,
  action,
  entityType,
  entityId = null,
  description,
  metadata = {},
  req = null,
}) => {
  try {
    const auditLog = await AuditLog.create({
      workspace: workspaceId,
      actor: userId,
      action,
      entityType,
      entityId,
      description,
      metadata,
      ipAddress:
        req?.ip ||
        req?.headers?.["x-forwarded-for"] ||
        "",
      userAgent: req?.headers?.["user-agent"] || "",
    });

    return auditLog;
  } catch (error) {
    console.error("AUDIT LOG CREATION ERROR:", error);
    return null;
  }
};

module.exports = {
  createAuditLog,
};