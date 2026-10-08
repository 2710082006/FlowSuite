
const express = require("express");

const protect = require("../middleware/authMiddleware");
const requireRole = require("../middleware/roleMiddleware");
const checkEntitlement = require("../middleware/entitlementMiddleware");

const { getProjectUsage } = require("../services/usageService");

const {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
} = require("../controllers/projectController");

const router = express.Router();

router.use(protect);

// All active workspace members can view projects
router.get("/", getProjects);

router.get("/:id", getProjectById);

// Owner, Admin and Manager can create projects
// Plan limit is checked before project creation
router.post(
  "/",
  requireRole("owner", "admin", "manager"),
  checkEntitlement("maxProjects", getProjectUsage),
  createProject
);

// Owner, Admin and Manager can update projects
router.put(
  "/:id",
  requireRole("owner", "admin", "manager"),
  updateProject
);

// Only Owner and Admin can delete projects
router.delete(
  "/:id",
  requireRole("owner", "admin"),
  deleteProject
);

module.exports = router;

