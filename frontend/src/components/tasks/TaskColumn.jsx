import { useDroppable } from "@dnd-kit/core";
import TaskCard from "./TaskCard";
import "./TaskColumn.css";

function TaskColumn({
  id,
  title,
  tasks,
  onEdit,
  onDelete,
  onView,
}) {
  const { setNodeRef, isOver } = useDroppable({
    id,
  });

  return (
    <div
      ref={setNodeRef}
      className={`task-column ${
        isOver ? "task-column-over" : ""
      }`}
    >
      <div className="task-column-header">
        <div>
          <h2>{title}</h2>
          <span>{tasks.length}</span>
        </div>
      </div>

      <div className="task-column-content">
        {tasks.map((task) => (
          <TaskCard
            key={task._id}
            task={task}
            onEdit={onEdit}
            onDelete={onDelete}
            onView={onView}
          />
        ))}

        {tasks.length === 0 && (
          <div className="task-column-empty">
            Drop tasks here
          </div>
        )}
      </div>
    </div>
  );
}

export default TaskColumn;