const Notification = require("../models/Notification");

const createNotification = async ({
  workspaceId,
  recipientId,
  type,
  title,
  message,
  entityType = "",
  entityId = null,
  metadata = {},
  notificationKey = "",
  scheduledFor = null,
}) => {
  try {
    if (!workspaceId || !recipientId) {
      return null;
    }

    if (notificationKey) {
      const existingNotification =
        await Notification.findOne({
          workspace: workspaceId,
          recipient: recipientId,
          notificationKey,
        });

      if (existingNotification) {
        return existingNotification;
      }
    }

    const notification =
      await Notification.create({
        workspace: workspaceId,
        recipient: recipientId,
        type,
        title,
        message,
        entityType,
        entityId,
        metadata,
        notificationKey,
        scheduledFor,
      });

    return notification;
  } catch (error) {
    console.error(
      "Create notification error:",
      error
    );

    return null;
  }
};

const createNotificationsForUsers = async ({
  workspaceId,
  recipientIds,
  type,
  title,
  message,
  entityType = "",
  entityId = null,
  metadata = {},
}) => {
  try {
    if (
      !workspaceId ||
      !recipientIds?.length
    ) {
      return [];
    }

    const notifications =
      recipientIds.map((recipientId) => ({
        workspace: workspaceId,
        recipient: recipientId,
        type,
        title,
        message,
        entityType,
        entityId,
        metadata,
      }));

    return await Notification.insertMany(
      notifications
    );
  } catch (error) {
    console.error(
      "Create multiple notifications error:",
      error
    );

    return [];
  }
};

module.exports = {
  createNotification,
  createNotificationsForUsers,
};