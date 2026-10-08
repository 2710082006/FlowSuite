const Task = require("../models/Task");
const Project = require("../models/Project");
const User = require("../models/User");
const { createAuditLog } = require("../services/auditService");
const {
  createNotification,
} = require("../services/notificationService");

const createTask = async (req, res) => {
  try {
    const {
      title,
      description,
      project,
      assignee,
      status,
      priority,
      dueDate,
      estimatedHours,
      tags,
    } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: "Task title is required",
      });
    }

    if (!project) {
      return res.status(400).json({
        success: false,
        message: "Project is required",
      });
    }

    if (!req.user.workspaceId) {
      return res.status(400).json({
        success: false,
        message: "User is not associated with a workspace",
      });
    }

    const projectExists = await Project.findOne({
      _id: project,
      workspace: req.user.workspaceId,
    });

    if (!projectExists) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    if (assignee) {
      const assignedUser = await User.findOne({
        _id: assignee,
        workspace: req.user.workspaceId,
        status: "active",
      });

      if (!assignedUser) {
        return res.status(400).json({
          success: false,
          message:
            "Assignee must be an active member of this workspace",
        });
      }
    }

    const task = await Task.create({
      title,
      description,
      project,
      assignee: assignee || null,
      createdBy: req.user.id,
      workspace: req.user.workspaceId,
      status,
      priority,
      dueDate: dueDate || null,
      estimatedHours,
      tags: tags || [],
    });

    if (task.assignee) {
      await createNotification({
        workspaceId: req.user.workspaceId,
        recipientId: task.assignee,
        type: "task_assigned",
        title: "New task assigned",
        message: `You have been assigned the task "${task.title}"`,
        entityType: "Task",
        entityId: task._id,
        metadata: {
          taskId: task._id,
          projectId: task.project,
        },
      });
    }

    const populatedTask = await Task.findById(task._id)
      .populate("project", "name")
      .populate("assignee", "name email")
      .populate("createdBy", "name email");

    return res.status(201).json({
      success: true,
      message: "Task created successfully",
      task: populatedTask,
    });
  } catch (error) {
    console.error("Create task error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create task",
    });
  }
};

const getTasks = async (req, res) => {
  try {
    if (!req.user.workspaceId) {
      return res.status(400).json({
        success: false,
        message: "User is not associated with a workspace",
      });
    }

    const filter = {
      workspace: req.user.workspaceId,
    };

    if (req.query.project) {
      filter.project = req.query.project;
    }

    if (req.query.status) {
      filter.status = req.query.status;
    }

    const tasks = await Task.find(filter)
      .populate("project", "name")
      .populate("assignee", "name email")
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      count: tasks.length,
      tasks,
    });
  } catch (error) {
    console.error("Get tasks error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch tasks",
    });
  }
};

const getTaskById = async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      workspace: req.user.workspaceId,
    })
      .populate("project", "name")
      .populate("assignee", "name email")
      .populate("createdBy", "name email");

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    return res.json({
      success: true,
      task,
    });
  } catch (error) {
    console.error("Get task error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch task",
    });
  }
};

const updateTask = async (req, res) => {
  try {
    const {
      title,
      description,
      assignee,
      status,
      priority,
      dueDate,
      estimatedHours,
      tags,
    } = req.body;

    const task = await Task.findOne({
      _id: req.params.id,
      workspace: req.user.workspaceId,
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }
if (
  req.user.role === "member" &&
  task.assignee?.toString() !== req.user.id
) {
  return res.status(403).json({
    success: false,
    message: "You can only update tasks assigned to you",
  });
}
    const previousStatus = task.status;
    const previousAssignee =
      task.assignee?.toString() || null;

    if (assignee !== undefined && assignee) {
      const assignedUser = await User.findOne({
        _id: assignee,
        workspace: req.user.workspaceId,
        status: "active",
      });

      if (!assignedUser) {
        return res.status(400).json({
          success: false,
          message:
            "Assignee must be an active member of this workspace",
        });
      }
    }

    if (title !== undefined) {
      task.title = title;
    }

    if (description !== undefined) {
      task.description = description;
    }

  if (assignee !== undefined) {
  if (req.user.role === "member") {
    return res.status(403).json({
      success: false,
      message: "Members cannot reassign tasks",
    });
  }

  task.assignee = assignee || null;
}

    if (status !== undefined) {
      task.status = status;
    }

    if (priority !== undefined) {
      task.priority = priority;
    }

    if (dueDate !== undefined) {
      task.dueDate = dueDate || null;
    }

    if (estimatedHours !== undefined) {
      task.estimatedHours = estimatedHours;
    }

    if (tags !== undefined) {
      task.tags = tags;
    }

    await task.save();

    if (
      assignee !== undefined &&
      assignee &&
      assignee !== previousAssignee
    ) {
      await createNotification({
        workspaceId: req.user.workspaceId,
        recipientId: assignee,
        type: "task_assigned",
        title: "Task assigned to you",
        message: `You have been assigned the task "${task.title}"`,
        entityType: "Task",
        entityId: task._id,
        metadata: {
          taskId: task._id,
          previousAssignee,
          newAssignee: assignee,
        },
      });

      await createAuditLog({
        workspaceId: req.user.workspaceId,
        userId: req.user.id,
        action: "updated",
        entityType: "Task",
        entityId: task._id,
        description: `Task "${task.title}" was assigned to a new member`,
        metadata: {
          previousAssignee,
          newAssignee: assignee,
        },
        req,
      });
    }

    if (
      status !== undefined &&
      previousStatus !== status
    ) {
      await createAuditLog({
        workspaceId: req.user.workspaceId,
        userId: req.user.id,
        action: "updated",
        entityType: "Task",
        entityId: task._id,
        description: `Task "${task.title}" status changed from ${previousStatus} to ${status}`,
        metadata: {
          previousStatus,
          newStatus: status,
        },
        req,
      });

      if (task.assignee) {
        await createNotification({
          workspaceId: req.user.workspaceId,
          recipientId: task.assignee,
          type: "task_status_changed",
          title: "Task status updated",
          message: `Task "${task.title}" changed from ${previousStatus} to ${status}`,
          entityType: "Task",
          entityId: task._id,
          metadata: {
            taskId: task._id,
            previousStatus,
            newStatus: status,
          },
        });
      }
    }

    const updatedTask = await Task.findById(task._id)
      .populate("project", "name")
      .populate("assignee", "name email")
      .populate("createdBy", "name email");

    return res.json({
      success: true,
      message: "Task updated successfully",
      task: updatedTask,
    });
  } catch (error) {
    console.error("Update task error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update task",
    });
  }
};

const deleteTask = async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      workspace: req.user.workspaceId,
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    const deletedTaskId = task._id;
    const deletedTaskTitle = task.title;

    await Task.deleteOne({
      _id: task._id,
       workspace: req.user.workspaceId,
    });

    await createAuditLog({
      workspaceId: req.user.workspaceId,
      userId: req.user.id,
      action: "deleted",
      entityType: "Task",
      entityId: deletedTaskId,
      description: `Task "${deletedTaskTitle}" was deleted`,
      metadata: {
        title: deletedTaskTitle,
      },
      req,
    });

    return res.json({
      success: true,
      message: "Task deleted successfully",
    });
  } catch (error) {
    console.error("Delete task error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete task",
    });
  }
};

module.exports = {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
};