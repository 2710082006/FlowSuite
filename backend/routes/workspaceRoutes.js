const express = require("express");

const protect = require("../middleware/authMiddleware");
const {
  getMyWorkspace,
  updateWorkspaceSettings,
} = require("../controllers/workspaceController");

const router = express.Router();

router.get("/", protect, getMyWorkspace);
router.put("/settings", protect, updateWorkspaceSettings);

module.exports = router;