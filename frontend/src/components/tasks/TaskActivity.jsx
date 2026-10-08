import {
  ArrowRight,
  CheckCircle2,
  Edit3,
  PlusCircle,
  UserRound,
} from "lucide-react";
import "./TaskActivity.css";

const getActionIcon = (action) => {
  if (action === "created") {
    return PlusCircle;
  }

  if (action === "updated") {
    return Edit3;
  }

  if (action === "deleted") {
    return CheckCircle2;
  }

  return UserRound;
};

const formatAction = (action) => {
  const labels = {
    created: "created this task",
    updated: "updated this task",
    deleted: "deleted this task",
  };

  return labels[action] || `${action} this task`;
};

const formatDateTime = (date) => {
  if (!date) {
    return "";
  }

  return new Date(date).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

function TaskActivity({ logs = [], loading }) {
  if (loading) {
    return (
      <div className="task-activity-loading">
        Loading activity...
      </div>
    );
  }

  if (!logs.length) {
    return (
      <div className="task-activity-empty">
        No activity recorded yet.
      </div>
    );
  }

  return (
    <div className="task-activity">
      {logs.map((log) => {
        const Icon = getActionIcon(log.action);

        return (
          <div
            className="task-activity-item"
            key={log._id}
          >
            <div className="task-activity-icon">
              <Icon size={15} />
            </div>

            <div className="task-activity-content">
              <p>
                <strong>
                  {log.actor?.name || "System"}
                </strong>{" "}
                {formatAction(log.action)}
              </p>

              <span>
                {log.description}
              </span>

              {log.metadata?.previousStatus &&
                log.metadata?.newStatus && (
                  <div className="task-activity-change">
                    <span>
                      {log.metadata.previousStatus}
                    </span>

                    <ArrowRight size={13} />

                    <span>
                      {log.metadata.newStatus}
                    </span>
                  </div>
                )}

              <time>
                {formatDateTime(log.createdAt)}
              </time>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default TaskActivity;