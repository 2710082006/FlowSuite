const Workspace = require("../models/Workspace");

const getMyWorkspace = async (req, res) => {
  try {
    const workspaceId = req.user.workspaceId;

    if (!workspaceId) {
      return res.status(404).json({
        success: false,
        message: "No workspace found for this user",
      });
    }

    const workspace = await Workspace.findById(workspaceId)
      .populate("owner", "name email");

    if (!workspace) {
      return res.status(404).json({
        success: false,
        message: "Workspace not found",
      });
    }

    res.json({
      success: true,
      workspace,
    });
  } catch (error) {
    console.error("Get workspace error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch workspace",
    });
  }
};
const updateWorkspaceSettings = async (req, res) => {
  try {
    const workspaceId = req.user.workspaceId;

    if (!workspaceId) {
      return res.status(404).json({
        success: false,
        message: "No workspace found for this user",
      });
    }

    if (!["owner", "admin"].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to update workspace settings",
      });
    }

    const { name, slug } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Workspace name is required",
      });
    }

    if (!slug || !slug.trim()) {
      return res.status(400).json({
        success: false,
        message: "Workspace slug is required",
      });
    }

    const cleanName = name.trim();

    const cleanSlug = slug
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

    if (!cleanSlug) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid workspace slug",
      });
    }

    const existingWorkspace = await Workspace.findOne({
      slug: cleanSlug,
      _id: { $ne: workspaceId },
    });

    if (existingWorkspace) {
      return res.status(409).json({
        success: false,
        message: "This workspace slug is already in use",
      });
    }

    const workspace = await Workspace.findByIdAndUpdate(
      workspaceId,
      {
        name: cleanName,
        slug: cleanSlug,
      },
      {
        new: true,
        runValidators: true,
      }
    ).populate("owner", "name email");

    if (!workspace) {
      return res.status(404).json({
        success: false,
        message: "Workspace not found",
      });
    }

    return res.json({
      success: true,
      message: "Workspace settings updated successfully",
      workspace,
    });
  } catch (error) {
    console.error(
      "Update workspace settings error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to update workspace settings",
    });
  }
};

module.exports = {
  getMyWorkspace,
  updateWorkspaceSettings,
};
