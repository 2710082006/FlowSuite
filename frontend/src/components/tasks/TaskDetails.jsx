import { useEffect, useState } from "react";
import {
  CalendarDays,
  Clock3,
  FolderKanban,
  Pencil,
  Tag,
  Trash2,
  User,
  X,
} from "lucide-react";

import api from "../../services/api";
import Badge from "../ui/Badge";
import Button from "../ui/Button";
import TaskActivity from "./TaskActivity";
import "./TaskDetails.css";

function getInitials(name = "") {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function formatDate(date) {
  if (!date) {
    return "Not set";
  }

  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatStatus(status) {
  const labels = {
    todo: "To Do",
    in_progress: "In Progress",
    review: "Review",
    completed: "Completed",
  };

  return labels[status] || status;
}

function TaskDetails({
  task,
  open,
  onClose,
  onEdit,
  onDelete,
}) {
  const [activity, setActivity] = useState([]);
  const [activityLoading, setActivityLoading] =
    useState(false);

  useEffect(() => {
    if (!open || !task?._id) {
      return;
    }

    let cancelled = false;

    const loadActivity = async () => {
      try {
        setActivityLoading(true);

        const response = await api.get(
          `/audit/tasks/${task._id}`
        );

        if (!cancelled) {
          setActivity(response.data.logs || []);
        }
      } catch (error) {
        console.error(
          "Failed to load task activity:",
          error
        );

        if (!cancelled) {
          setActivity([]);
        }
      } finally {
        if (!cancelled) {
          setActivityLoading(false);
        }
      }
    };

    loadActivity();

    return () => {
      cancelled = true;
    };
  }, [open, task?._id]);

  if (!open || !task) {
    return null;
  }

  return (
    <div
      className="task-details-overlay"
      onMouseDown={onClose}
    >
      <aside
        className="task-details-panel"
        onMouseDown={(event) =>
          event.stopPropagation()
        }
      >
        <div className="task-details-header">
          <div>
            <span className="task-details-label">
              TASK DETAILS
            </span>

            <h2>{task.title}</h2>
          </div>

          <button
            type="button"
            className="task-details-close"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>

        <div className="task-details-content">
          <div className="task-details-status-row">
            <Badge variant={task.priority}>
              {task.priority}
            </Badge>

            <span className="task-details-status">
              {formatStatus(task.status)}
            </span>
          </div>

          <section className="task-details-section">
            <h3>Description</h3>

            <p className="task-details-description">
              {task.description ||
                "No description added for this task."}
            </p>
          </section>

          <section className="task-details-section">
            <h3>Task information</h3>

            <div className="task-details-info">
              <div className="task-details-info-item">
                <span>
                  <FolderKanban size={16} />
                  Project
                </span>

                <strong>
                  {task.project?.name ||
                    "No project"}
                </strong>
              </div>

              <div className="task-details-info-item">
                <span>
                  <User size={16} />
                  Assignee
                </span>

                <strong className="task-details-assignee">
                  {task.assignee ? (
                    <>
                      <span className="task-details-avatar">
                        {getInitials(
                          task.assignee.name
                        )}
                      </span>

                      {task.assignee.name}
                    </>
                  ) : (
                    "Unassigned"
                  )}
                </strong>
              </div>

              <div className="task-details-info-item">
                <span>
                  <CalendarDays size={16} />
                  Due date
                </span>

                <strong>
                  {formatDate(task.dueDate)}
                </strong>
              </div>

              <div className="task-details-info-item">
                <span>
                  <Clock3 size={16} />
                  Estimated hours
                </span>

                <strong>
                  {task.estimatedHours || 0} hours
                </strong>
              </div>
            </div>
          </section>

          <section className="task-details-section">
            <h3>
              <Tag size={16} />
              Tags
            </h3>

            {task.tags?.length ? (
              <div className="task-details-tags">
                {task.tags.map((tag) => (
                  <span key={tag}>
                    {tag}
                  </span>
                ))}
              </div>
            ) : (
              <p className="task-details-muted">
                No tags added.
              </p>
            )}
          </section>

          <section className="task-details-section">
            <h3>Activity information</h3>

            <div className="task-details-dates">
              <div>
                <span>Created</span>

                <strong>
                  {formatDate(task.createdAt)}
                </strong>
              </div>

              <div>
                <span>Last updated</span>

                <strong>
                  {formatDate(task.updatedAt)}
                </strong>
              </div>
            </div>
          </section>

          <section className="task-details-section">
            <h3>Activity</h3>

            <TaskActivity
              logs={activity}
              loading={activityLoading}
            />
          </section>
        </div>

        <div className="task-details-footer">
          <Button
            variant="secondary"
            onClick={() => {
              onClose();
              onDelete(task);
            }}
          >
            <Trash2 size={15} />
            Delete
          </Button>

          <Button
            onClick={() => {
              onClose();
              onEdit(task);
            }}
          >
            <Pencil size={15} />
            Edit Task
          </Button>
        </div>
      </aside>
    </div>
  );
}

export default TaskDetails;