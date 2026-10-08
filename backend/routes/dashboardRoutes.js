const express = require("express");

const protect = require("../middleware/authMiddleware");

const {
  getDashboardOverview,
} = require("../controllers/dashboardController");

const router = express.Router();

router.use(protect);

router.get(
  "/overview",
  getDashboardOverview
);

module.exports = router;