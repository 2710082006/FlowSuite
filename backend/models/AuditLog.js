const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema(
{
workspace: {
type: mongoose.Schema.Types.ObjectId,
ref: "Workspace",
required: true,
index: true,
},


actor: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "User",
  default: null,
},

action: {
  type: String,
  required: true,
  trim: true,
},

entityType: {
  type: String,
  required: true,
  trim: true,
},

entityId: {
  type: mongoose.Schema.Types.ObjectId,
  default: null,
},

description: {
  type: String,
  required: true,
  trim: true,
},

metadata: {
  type: mongoose.Schema.Types.Mixed,
  default: {},
},

ipAddress: {
  type: String,
  default: "",
},

userAgent: {
  type: String,
  default: "",
},



},
{
timestamps: true,
}
);

auditLogSchema.index({
workspace: 1,
createdAt: -1,
});

auditLogSchema.index({
workspace: 1,
entityType: 1,
createdAt: -1,
});

const AuditLog = mongoose.model("AuditLog", auditLogSchema);

module.exports = AuditLog;
