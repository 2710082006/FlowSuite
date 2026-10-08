const express = require("express");

const protect = require("../middleware/authMiddleware");
const requireRole = require("../middleware/roleMiddleware");

const {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
} = require("../controllers/taskController");

const router = express.Router();

router.use(protect);

// All active members can view tasks
router.get("/", getTasks);
router.get("/:id", getTaskById);

// Owner, Admin and Manager can create tasks
router.post(
  "/",
  requireRole("owner", "admin", "manager"),
  createTask
);

// Owner, Admin, Manager and Member can update tasks
router.put(
  "/:id",
  requireRole(
    "owner",
    "admin",
    "manager",
    "member"
  ),
  updateTask
);

// Only Owner and Admin can delete tasks
router.delete(
  "/:id",
  requireRole("owner", "admin",),
  deleteTask
);

module.exports = router;