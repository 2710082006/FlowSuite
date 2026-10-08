const cron = require("node-cron");

const Task = require("../models/Task");
const {
  createNotification,
} = require("./notificationService");

const runTaskNotificationCheck = async () => {
  try {
    const now = new Date();

    const next24Hours = new Date(
      now.getTime() + 24 * 60 * 60 * 1000
    );

    const tasks = await Task.find({
      assignee: {
        $ne: null,
      },
      status: {
        $ne: "completed",
      },
      dueDate: {
        $ne: null,
      },
    });

    for (const task of tasks) {
      const dueDate = new Date(task.dueDate);

      const isOverdue = dueDate < now;

      const isDueSoon =
        dueDate >= now &&
        dueDate <= next24Hours;

      if (!isOverdue && !isDueSoon) {
        continue;
      }

      const notificationType = isOverdue
        ? "task_overdue"
        : "task_due";

      const notificationKey =
        `${notificationType}:${task._id}`;

      await createNotification({
        workspaceId: task.workspace,
        recipientId: task.assignee,
        type: notificationType,
        title: isOverdue
          ? "Task overdue"
          : "Task due soon",
        message: isOverdue
          ? `Task "${task.title}" is overdue.`
          : `Task "${task.title}" is due within the next 24 hours.`,
        entityType: "Task",
        entityId: task._id,
        notificationKey,
        scheduledFor: now,
        metadata: {
          taskId: task._id,
          dueDate: task.dueDate,
        },
      });
    }

    console.log(
      "Task notification check completed"
    );
  } catch (error) {
    console.error(
      "Task notification scheduler error:",
      error
    );
  }
};

const startTaskNotificationScheduler = () => {
  cron.schedule(
    "*/15 * * * *",
    async () => {
      await runTaskNotificationCheck();
    }
  );

  console.log(
    "Task notification scheduler started"
  );
};

module.exports = {
  startTaskNotificationScheduler,
  runTaskNotificationCheck,
};