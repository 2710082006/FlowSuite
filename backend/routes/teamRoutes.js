
const express = require("express");

const protect = require("../middleware/authMiddleware");
const requireRole = require("../middleware/roleMiddleware");
const checkEntitlement = require("../middleware/entitlementMiddleware");

const { getMemberUsage } = require("../services/usageService");

const {
  getTeamMembers,
  addTeamMember,
  updateMemberRole,
  removeTeamMember,
} = require("../controllers/teamController");

const router = express.Router();

router.use(protect);

// Everyone with active membership can view team
router.get("/", getTeamMembers);

// Only owner/admin can add members
// Plan member limit is checked before member creation
router.post(
  "/",
  requireRole("owner", "admin"),
  checkEntitlement("maxMembers", getMemberUsage),
  addTeamMember
);

// Only owner/admin can change roles
router.put(
  "/:id/role",
  requireRole("owner", "admin"),
  updateMemberRole
);

// Only owner/admin can remove members
router.delete(
  "/:id",
  requireRole("owner", "admin"),
  removeTeamMember
);

module.exports = router;

