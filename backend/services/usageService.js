
const Project = require("../models/Project");
const Customer = require("../models/Customer");
const WorkspaceMember = require("../models/WorkspaceMember");
const getProjectUsage = async (workspaceId) => {
  const count = await Project.countDocuments({
    workspace: workspaceId,
  });

  return count;
};

const getCustomerUsage = async (workspaceId) => {
  const count = await Customer.countDocuments({
    workspace: workspaceId,
  });

  return count;
};
const getMemberUsage = async (workspaceId) => { const count = await WorkspaceMember.countDocuments({ workspace: workspaceId, status: "active", }); return count; };
module.exports = {
  getProjectUsage,
  getCustomerUsage,
  getMemberUsage,
};

