import { DndContext } from "@dnd-kit/core";
import TaskColumn from "./TaskColumn";
import "./TaskBoard.css";

const columns = [
  {
    id: "todo",
    title: "To Do",
  },
  {
    id: "in_progress",
    title: "In Progress",
  },
  {
    id: "review",
    title: "Review",
  },
  {
    id: "completed",
    title: "Completed",
  },
];

function TaskBoard({
  tasks,
  onTaskMove,
  onTaskEdit,
  onTaskDelete,
  onTaskView,
}) {
  const getTasksByStatus = (status) => {
    return tasks.filter(
      (task) => task.status === status
    );
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (!over) {
      return;
    }

    const taskId = active.id;
    const newStatus = over.id;

    const task = tasks.find(
      (item) => item._id === taskId
    );

    if (!task) {
      return;
    }

    if (task.status === newStatus) {
      return;
    }

    const validStatus = columns.some(
      (column) => column.id === newStatus
    );

    if (!validStatus) {
      return;
    }

    onTaskMove(taskId, newStatus);
  };

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="task-board">
        {columns.map((column) => (
          <TaskColumn
            key={column.id}
            id={column.id}
            title={column.title}
            tasks={getTasksByStatus(column.id)}
            onEdit={onTaskEdit}
            onDelete={onTaskDelete}
            onView={onTaskView}
          />
        ))}
      </div>
    </DndContext>
  );
}

export default TaskBoard;