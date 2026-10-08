
const express = require("express");

const protect = require("../middleware/authMiddleware");
const requireRole = require("../middleware/roleMiddleware");
const checkEntitlement = require("../middleware/entitlementMiddleware");

const { getCustomerUsage } = require("../services/usageService");

const {
  createCustomer,
  getCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
} = require("../controllers/customerController");

const router = express.Router();

router.use(protect);

// All active workspace members can view customers
router.get("/", getCustomers);

router.get("/:id", getCustomerById);

// Owner, Admin and Manager can create customers
// Plan limit is checked before customer creation
router.post(
  "/",
  requireRole("owner", "admin", "manager"),
  checkEntitlement("maxCustomers", getCustomerUsage),
  createCustomer
);

// Owner, Admin and Manager can update customers
router.put(
  "/:id",
  requireRole("owner", "admin", "manager"),
  updateCustomer
);

// Only Owner and Admin can delete customers
router.delete(
  "/:id",
  requireRole("owner", "admin"),
  deleteCustomer
);

module.exports = router;

