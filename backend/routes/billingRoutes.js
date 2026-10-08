const express = require("express");

const protect = require("../middleware/authMiddleware");
const requireRole = require("../middleware/roleMiddleware");

const {
  getPlans,
  getCurrentSubscription,
  getBillingOverview,
  changePlan,
  cancelSubscription,
  reactivateSubscription,
} = require("../controllers/billingController");

const router = express.Router();

router.use(protect);

router.get("/plans", getPlans);
router.get("/subscription", getCurrentSubscription);
router.get("/overview", getBillingOverview);

router.put(
  "/subscription/plan",
  requireRole("owner", "admin"),
  changePlan
);

router.put(
  "/subscription/cancel",
  requireRole("owner", "admin"),
  cancelSubscription
);

router.put(
  "/subscription/reactivate",
  requireRole("owner", "admin"),
  reactivateSubscription
);

module.exports = router;