const Project = require("../models/Project");
const { createAuditLog } = require("../services/auditService");

const createProject = async (req, res) => {
  try {
    const {
      name,
      description,
      status,
      priority,
      startDate,
      dueDate,
    } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Project name is required",
      });
    }

    if (!req.user.workspaceId) {
      return res.status(400).json({
        success: false,
        message: "User is not associated with a workspace",
      });
    }

    const project = await Project.create({
      name,
      description,
      status,
      priority,
      startDate: startDate || null,
      dueDate: dueDate || null,
      workspace: req.user.workspaceId,
      owner: req.user.id,
    });

    await createAuditLog({
      workspaceId: req.user.workspaceId,
      userId: req.user.id,
      action: "created",
      entityType: "Project",
      entityId: project._id,
      description: `Project "${project.name}" was created`,
      metadata: {
        name: project.name,
        status: project.status,
      },
      req,
    });

    return res.status(201).json({
      success: true,
      message: "Project created successfully",
      project,
    });
  } catch (error) {
    console.error("Create project error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create project",
    });
  }
};

const getProjects = async (req, res) => {
  try {
    if (!req.user.workspaceId) {
      return res.status(400).json({
        success: false,
        message: "User is not associated with a workspace",
      });
    }

    const projects = await Project.find({
      workspace: req.user.workspaceId,
    })
      .populate("owner", "name email")
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      count: projects.length,
      projects,
    });
  } catch (error) {
    console.error("Get projects error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch projects",
    });
  }
};

const getProjectById = async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      workspace: req.user.workspaceId,
    }).populate("owner", "name email");

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    return res.json({
      success: true,
      project,
    });
  } catch (error) {
    console.error("Get project error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch project",
    });
  }
};

const updateProject = async (req, res) => {
  try {
    const {
      name,
      description,
      status,
      priority,
      startDate,
      dueDate,
      progress,
    } = req.body;

    const project = await Project.findOne({
      _id: req.params.id,
      workspace: req.user.workspaceId,
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    if (name !== undefined) {
      project.name = name;
    }

    if (description !== undefined) {
      project.description = description;
    }

    if (status !== undefined) {
      project.status = status;
    }

    if (priority !== undefined) {
      project.priority = priority;
    }

    if (startDate !== undefined) {
      project.startDate = startDate || null;
    }

    if (dueDate !== undefined) {
      project.dueDate = dueDate || null;
    }

    if (progress !== undefined) {
      project.progress = progress;
    }

    await project.save();

    const updatedProject = await Project.findById(project._id).populate(
      "owner",
      "name email"
    );

    await createAuditLog({
      workspaceId: req.user.workspaceId,
      userId: req.user.id,
      action: "updated",
      entityType: "Project",
      entityId: project._id,
      description: `Project "${project.name}" was updated`,
      req,
    });

    return res.json({
      success: true,
      message: "Project updated successfully",
      project: updatedProject,
    });
  } catch (error) {
    console.error("Update project error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update project",
    });
  }
};

const deleteProject = async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      workspace: req.user.workspaceId,
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }
await Project.deleteOne({
  _id: project._id,
  workspace: req.user.workspaceId,
});
    await createAuditLog({
      workspaceId: req.user.workspaceId,
      userId: req.user.id,
      action: "deleted",
      entityType: "Project",
      entityId: project._id,
      description: `Project "${project.name}" was deleted`,
      req,
    });

    return res.json({
      success: true,
      message: "Project deleted successfully",
    });
  } catch (error) {
    console.error("Delete project error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete project",
    });
  }
};

module.exports = {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
};