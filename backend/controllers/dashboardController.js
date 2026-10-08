const Project = require("../models/Project");
const Task = require("../models/Task");
const Customer = require("../models/Customer");
const WorkspaceMember = require("../models/WorkspaceMember");
const AuditLog = require("../models/AuditLog");
const Subscription = require("../models/Subscription");

const getDashboardOverview = async (req, res) => {
  try {
    const workspaceId = req.user.workspaceId;

    if (!workspaceId) {
      return res.status(400).json({
        success: false,
        message: "Workspace information is missing",
      });
    }

    const [
      totalProjects,
      totalTasks,
      completedTasks,
      totalCustomers,
      totalMembers,
      overdueTasks,
      recentTasks,
      recentActivity,
      statusStats,
      priorityStats,
      projectProgress,
      subscription,
    ] = await Promise.all([
      Project.countDocuments({
        workspace: workspaceId,
      }),

      Task.countDocuments({
        workspace: workspaceId,
      }),

      Task.countDocuments({
        workspace: workspaceId,
        status: "completed",
      }),

      Customer.countDocuments({
        workspace: workspaceId,
      }),

      WorkspaceMember.countDocuments({
        workspace: workspaceId,
        status: "active",
      }),

      Task.countDocuments({
        workspace: workspaceId,
        status: {
          $ne: "completed",
        },
        dueDate: {
          $lt: new Date(),
          $ne: null,
        },
      }),

      Task.find({
        workspace: workspaceId,
      })
        .populate("project", "name")
        .populate(
          "assignee",
          "name email avatar"
        )
        .sort({
          updatedAt: -1,
        })
        .limit(5),

      AuditLog.find({
        workspace: workspaceId,
      })
        .populate(
          "actor",
          "name email role"
        )
        .sort({
          createdAt: -1,
        })
        .limit(8),

      Task.aggregate([
        {
          $match: {
            workspace: workspaceId,
          },
        },
        {
          $group: {
            _id: "$status",
            count: {
              $sum: 1,
            },
          },
        },
      ]),

      Task.aggregate([
        {
          $match: {
            workspace: workspaceId,
          },
        },
        {
          $group: {
            _id: "$priority",
            count: {
              $sum: 1,
            },
          },
        },
      ]),

      Project.aggregate([
        {
          $match: {
            workspace: workspaceId,
          },
        },
        {
          $lookup: {
            from: "tasks",
            localField: "_id",
            foreignField: "project",
            as: "tasks",
          },
        },
        {
          $project: {
            name: 1,
            status: 1,
            totalTasks: {
              $size: "$tasks",
            },
            completedTasks: {
              $size: {
                $filter: {
                  input: "$tasks",
                  as: "task",
                  cond: {
                    $eq: [
                      "$$task.status",
                      "completed",
                    ],
                  },
                },
              },
            },
          },
        },
        {
          $sort: {
            totalTasks: -1,
          },
        },
        {
          $limit: 6,
        },
      ]),

      Subscription.findOne({
        workspace: workspaceId,
        status: {
          $in: [
            "trialing",
            "active",
          ],
        },
      }).populate("plan"),
    ]);

    const completionRate =
      totalTasks > 0
        ? Math.round(
            (completedTasks / totalTasks) *
              100
          )
        : 0;

    const tasksByStatus = {
      todo: 0,
      in_progress: 0,
      review: 0,
      completed: 0,
    };

    statusStats.forEach((item) => {
      if (
        Object.prototype.hasOwnProperty.call(
          tasksByStatus,
          item._id
        )
      ) {
        tasksByStatus[item._id] =
          item.count;
      }
    });

    const tasksByPriority = {
      low: 0,
      medium: 0,
      high: 0,
      critical: 0,
    };

    priorityStats.forEach((item) => {
      if (
        Object.prototype.hasOwnProperty.call(
          tasksByPriority,
          item._id
        )
      ) {
        tasksByPriority[item._id] =
          item.count;
      }
    });

    const formattedProjectProgress =
      projectProgress.map((project) => ({
        _id: project._id,
        name: project.name,
        status: project.status,
        totalTasks: project.totalTasks,
        completedTasks:
          project.completedTasks,
        completionRate:
          project.totalTasks > 0
            ? Math.round(
                (project.completedTasks /
                  project.totalTasks) *
                  100
              )
            : 0,
      }));

    let planUsage = null;

    if (subscription?.plan) {
      const features =
        subscription.plan.features;

      planUsage = {
        planName: subscription.plan.name,
        displayName:
          subscription.plan.displayName,

        projects: {
          used: totalProjects,
          limit: features.maxProjects,
        },

        members: {
          used: totalMembers,
          limit: features.maxMembers,
        },

        customers: {
          used: totalCustomers,
          limit: features.maxCustomers,
        },
      };
    }

    return res.status(200).json({
      success: true,

      stats: {
        totalProjects,
        totalTasks,
        completedTasks,
        pendingTasks:
          totalTasks - completedTasks,
        totalCustomers,
        totalMembers,
        overdueTasks,
        completionRate,
      },

      taskAnalytics: {
        byStatus: tasksByStatus,
        byPriority: tasksByPriority,
      },

      projectProgress:
        formattedProjectProgress,

      planUsage,

      recentTasks,

      recentActivity,
    });
  } catch (error) {
    console.error(
      "Get dashboard overview error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch dashboard overview",
    });
  }
};

module.exports = {
  getDashboardOverview,
};