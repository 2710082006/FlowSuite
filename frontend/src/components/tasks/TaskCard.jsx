import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  CalendarDays,
  MoreHorizontal,
  Pencil,
  Trash2,
  User,
} from "lucide-react";
import Badge from "../ui/Badge";
import "./TaskCard.css";

function getInitials(name = "") {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function TaskCard({ task, onEdit, onDelete ,onView,}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task._id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`task-card ${
        isDragging ? "task-card-dragging" : ""
      }`}
      {...attributes}
       onDoubleClick={() => onView(task)}
    >
      <div
        className="task-card-drag-area"
        {...listeners}
      >
        <div className="task-card-top">
          <Badge variant={task.priority}>
            {task.priority}
          </Badge>

          <div
            className="task-card-actions"
            onPointerDown={(event) =>
              event.stopPropagation()
            }
          >
            <button
              type="button"
              title="Edit task"
              onClick={(event) => {
                event.stopPropagation();
                onEdit(task);
              }}
            >
              <Pencil size={14} />
            </button>

            <button
              type="button"
              title="Delete task"
              onClick={(event) => {
                event.stopPropagation();
                onDelete(task);
              }}
            >
              <Trash2 size={14} />
            </button>

            <MoreHorizontal size={16} />
          </div>
        </div>

        <h3>{task.title}</h3>

        {task.description && (
          <p className="task-card-description">
            {task.description}
          </p>
        )}

        <div className="task-card-meta">
          {task.assignee && (
            <span>
              <span className="task-assignee-avatar">
                {getInitials(task.assignee.name)}
              </span>

              {task.assignee.name}
            </span>
          )}

          {task.dueDate && (
            <span>
              <CalendarDays size={14} />

              {new Date(
                task.dueDate
              ).toLocaleDateString("en-IN")}
            </span>
          )}
        </div>

        {!task.assignee && (
          <div className="task-unassigned">
            <User size={13} />
            Unassigned
          </div>
        )}
      </div>
    </div>
  );
}

export default TaskCard;