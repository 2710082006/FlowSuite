const Notification = require("../models/Notification");

const getNotifications = async (
  req,
  res
) => {
  try {
    const workspaceId =
      req.user.workspaceId;

    const userId = req.user.id;

    const notifications =
      await Notification.find({
        workspace: workspaceId,
        recipient: userId,
      })
        .sort({
          createdAt: -1,
        })
        .limit(50);

    const unreadCount =
      await Notification.countDocuments({
        workspace: workspaceId,
        recipient: userId,
        isRead: false,
      });

    return res.status(200).json({
      success: true,
      count: notifications.length,
      unreadCount,
      notifications,
    });
  } catch (error) {
    console.error(
      "Get notifications error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch notifications",
    });
  }
};

const markNotificationAsRead =
  async (req, res) => {
    try {
      const notification =
        await Notification.findOne({
          _id: req.params.id,
          workspace:
            req.user.workspaceId,
          recipient: req.user.id,
        });

      if (!notification) {
        return res.status(404).json({
          success: false,
          message:
            "Notification not found",
        });
      }

      notification.isRead = true;
      notification.readAt = new Date();

      await notification.save();

      return res.status(200).json({
        success: true,
        message:
          "Notification marked as read",
        notification,
      });
    } catch (error) {
      console.error(
        "Mark notification read error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to update notification",
      });
    }
  };

const markAllNotificationsAsRead =
  async (req, res) => {
    try {
      await Notification.updateMany(
        {
          workspace:
            req.user.workspaceId,
          recipient: req.user.id,
          isRead: false,
        },
        {
          $set: {
            isRead: true,
            readAt: new Date(),
          },
        }
      );

      return res.status(200).json({
        success: true,
        message:
          "All notifications marked as read",
      });
    } catch (error) {
      console.error(
        "Mark all notifications read error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to update notifications",
      });
    }
  };

const deleteNotification =
  async (req, res) => {
    try {
      const notification =
        await Notification.findOne({
          _id: req.params.id,
          workspace:
            req.user.workspaceId,
          recipient: req.user.id,
        });

      if (!notification) {
        return res.status(404).json({
          success: false,
          message:
            "Notification not found",
        });
      }

      await Notification.deleteOne({
        _id: notification._id,
      });

      return res.status(200).json({
        success: true,
        message:
          "Notification deleted",
      });
    } catch (error) {
      console.error(
        "Delete notification error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to delete notification",
      });
    }
  };

module.exports = {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
};