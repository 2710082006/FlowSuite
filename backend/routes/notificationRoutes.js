const express = require("express");

const protect = require("../middleware/authMiddleware");

const {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} = require("../controllers/notificationController");

const router = express.Router();

router.use(protect);

router.get(
  "/",
  getNotifications
);

router.put(
  "/read-all",
  markAllNotificationsAsRead
);

router.put(
  "/:id/read",
  markNotificationAsRead
);

router.delete(
  "/:id",
  deleteNotification
);

module.exports = router;