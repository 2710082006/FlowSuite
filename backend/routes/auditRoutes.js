const express = require("express");

const protect = require("../middleware/authMiddleware");
const checkEntitlement = require("../middleware/entitlementMiddleware");

const { getAuditLogs,getTaskActivity } = require("../controllers/auditController");

const router = express.Router();

router.use(protect);
router.get(
  "/tasks/:taskId",
  checkEntitlement("auditLogs"),
  getTaskActivity
);
router.get(
"/",
checkEntitlement("auditLogs"),
getAuditLogs
);

module.exports = router;
