const AuditLog = require("../models/AuditLog");
const Task = require("../models/Task");
const getAuditLogs = async (req, res) => {
try {
const workspaceId = req.user.workspaceId;


const logs = await AuditLog.find({
  workspace: workspaceId,
})
  .populate("actor", "name email role")
  .sort({ createdAt: -1 })
  .limit(100);

return res.status(200).json({
  success: true,
  count: logs.length,
  logs,
});


} catch (error) {
console.error("Get audit logs error:", error);


return res.status(500).json({
  success: false,
  message: "Failed to fetch audit logs",
});


}
};
const getTaskActivity = async (req, res) => {
  try {
    const workspaceId = req.user.workspaceId;
    const taskId = req.params.taskId;

    const task = await Task.findOne({
      _id: taskId,
      workspace: workspaceId,
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    const logs = await AuditLog.find({
      workspace: workspaceId,
      entityType: "Task",
      entityId: taskId,
    })
      .populate("actor", "name email role")
      .sort({ createdAt: -1 })
      .limit(50);

    return res.status(200).json({
      success: true,
      count: logs.length,
      logs,
    });
  } catch (error) {
    console.error(
      "Get task activity error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch task activity",
    });
  }
};
module.exports = {
getAuditLogs,
getTaskActivity,
};
