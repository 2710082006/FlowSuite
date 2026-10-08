import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Filter,
  Plus,
  Search,
  X,
} from "lucide-react";
import api from "../../services/api";
import Button from "../../components/ui/Button";
import TaskBoard from "../../components/tasks/TaskBoard";
import TaskModal from "../../components/tasks/TaskModal";
import Toast from "../../components/ui/Toast";
import TaskDetails from "../../components/tasks/TaskDetails";
import "./Tasks.css";

function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);
const [viewingTask, setViewingTask] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] =
    useState("all");
  const [assigneeFilter, setAssigneeFilter] =
    useState("all");
  const [dueDateFilter, setDueDateFilter] =
    useState("all");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const loadData = async () => {
      try {
        const [tasksResponse, projectsResponse] =
          await Promise.all([
            api.get("/tasks"),
            api.get("/projects"),
          ]);

        if (!cancelled) {
          setTasks(tasksResponse.data.tasks || []);
          setProjects(
            projectsResponse.data.projects || []
          );
        }
      } catch (error) {
        console.error(
          "Failed to load task data:",
          error
        );

        if (!cancelled) {
          setError(
            error.response?.data?.message ||
              "Failed to load tasks"
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      cancelled = true;
    };
  }, []);

  const showToast = (
    message,
    type = "success"
  ) => {
    setToast({
      message,
      type,
    });

    window.setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  const assignees = useMemo(() => {
    const map = new Map();

    tasks.forEach((task) => {
      if (task.assignee?._id) {
        map.set(
          task.assignee._id,
          task.assignee
        );
      }
    });

    return Array.from(map.values());
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    const searchValue = search
      .trim()
      .toLowerCase();

    return tasks.filter((task) => {
      const matchesSearch =
        !searchValue ||
        task.title
          ?.toLowerCase()
          .includes(searchValue) ||
        task.description
          ?.toLowerCase()
          .includes(searchValue);

      const matchesStatus =
        statusFilter === "all" ||
        task.status === statusFilter;

      const matchesPriority =
        priorityFilter === "all" ||
        task.priority === priorityFilter;

      const matchesAssignee =
        assigneeFilter === "all" ||
        task.assignee?._id === assigneeFilter;

      let matchesDueDate = true;

      if (dueDateFilter !== "all") {
        if (!task.dueDate) {
          matchesDueDate = false;
        } else {
          const dueDate = new Date(task.dueDate);
          const today = new Date();

          today.setHours(0, 0, 0, 0);
          dueDate.setHours(0, 0, 0, 0);

          if (dueDateFilter === "overdue") {
            matchesDueDate =
              dueDate < today &&
              task.status !== "completed";
          }

          if (dueDateFilter === "today") {
            matchesDueDate =
              dueDate.getTime() ===
              today.getTime();
          }

          if (dueDateFilter === "upcoming") {
            matchesDueDate =
              dueDate >= today;
          }
        }
      }

      return (
        matchesSearch &&
        matchesStatus &&
        matchesPriority &&
        matchesAssignee &&
        matchesDueDate
      );
    });
  }, [
    tasks,
    search,
    statusFilter,
    priorityFilter,
    assigneeFilter,
    dueDateFilter,
  ]);

  const hasActiveFilters =
    search.trim() !== "" ||
    statusFilter !== "all" ||
    priorityFilter !== "all" ||
    assigneeFilter !== "all" ||
    dueDateFilter !== "all";

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setPriorityFilter("all");
    setAssigneeFilter("all");
    setDueDateFilter("all");
  };

  const handleCreateTask = () => {
    setEditingTask(null);
    setModalOpen(true);
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setModalOpen(true);
  };

  const handleTaskSaved = (savedTask) => {
    const exists = tasks.some(
      (task) => task._id === savedTask._id
    );

    setTasks((currentTasks) => {
      if (exists) {
        return currentTasks.map((task) =>
          task._id === savedTask._id
            ? savedTask
            : task
        );
      }

      return [savedTask, ...currentTasks];
    });

    showToast(
      exists
        ? "Task updated successfully"
        : "Task created successfully"
    );
  };

  const handleTaskMove = async (
    taskId,
    newStatus
  ) => {
    const previousTasks = [...tasks];

    setError("");

    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task._id === taskId
          ? {
              ...task,
              status: newStatus,
            }
          : task
      )
    );

    try {
      const response = await api.put(
        `/tasks/${taskId}`,
        {
          status: newStatus,
        }
      );

      setTasks((currentTasks) =>
        currentTasks.map((task) =>
          task._id === taskId
            ? response.data.task
            : task
        )
      );

      showToast("Task status updated");
    } catch (error) {
      console.error(
        "Failed to update task status:",
        error
      );

      setTasks(previousTasks);

      const message =
        error.response?.data?.message ||
        "Failed to update task status";

      setError(message);
      showToast(message, "error");
    }
  };

  const handleDeleteTask = async (task) => {
    const confirmed = window.confirm(
      `Delete "${task.title}"? This action cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await api.delete(`/tasks/${task._id}`);

      setTasks((currentTasks) =>
        currentTasks.filter(
          (item) => item._id !== task._id
        )
      );

      showToast("Task deleted successfully");
    } catch (error) {
      console.error(
        "Failed to delete task:",
        error
      );

      const message =
        error.response?.data?.message ||
        "Failed to delete task";

      setError(message);
      showToast(message, "error");
    }
  };

  if (loading) {
    return (
      <div className="tasks-page-state">
        Loading tasks...
      </div>
    );
  }

  if (error && tasks.length === 0) {
    return (
      <div className="tasks-page-state tasks-page-error">
        {error}
      </div>
    );
  }

  return (
    <div className="tasks-page">
      <div className="tasks-header">
        <div>
          <h1>Tasks</h1>
          <p>
            Manage and track your workspace tasks.
          </p>
        </div>

        <Button onClick={handleCreateTask}>
          <Plus size={17} />
          Create Task
        </Button>
      </div>

      {error && (
        <div className="tasks-error-banner">
          {error}
        </div>
      )}

      <div className="tasks-toolbar">
        <div className="tasks-search">
          <Search size={17} />

          <input
            type="text"
            placeholder="Search tasks..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />

          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
            >
              <X size={15} />
            </button>
          )}
        </div>

        <button
          type="button"
          className={`tasks-filter-toggle ${
            showFilters
              ? "tasks-filter-toggle-active"
              : ""
          }`}
          onClick={() =>
            setShowFilters((current) => !current)
          }
        >
          <Filter size={16} />
          Filters
        </button>

        {hasActiveFilters && (
          <button
            type="button"
            className="tasks-clear-filters"
            onClick={clearFilters}
          >
            Clear filters
          </button>
        )}
      </div>

      {showFilters && (
        <div className="tasks-filters">
          <div className="tasks-filter-field">
            <label>Status</label>

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value)
              }
            >
              <option value="all">
                All statuses
              </option>
              <option value="todo">
                To Do
              </option>
              <option value="in_progress">
                In Progress
              </option>
              <option value="review">
                Review
              </option>
              <option value="completed">
                Completed
              </option>
            </select>
          </div>

          <div className="tasks-filter-field">
            <label>Priority</label>

            <select
              value={priorityFilter}
              onChange={(event) =>
                setPriorityFilter(event.target.value)
              }
            >
              <option value="all">
                All priorities
              </option>
              <option value="low">
                Low
              </option>
              <option value="medium">
                Medium
              </option>
              <option value="high">
                High
              </option>
              <option value="critical">
                Critical
              </option>
            </select>
          </div>

          <div className="tasks-filter-field">
            <label>Assignee</label>

            <select
              value={assigneeFilter}
              onChange={(event) =>
                setAssigneeFilter(event.target.value)
              }
            >
              <option value="all">
                All members
              </option>

              {assignees.map((member) => (
                <option
                  key={member._id}
                  value={member._id}
                >
                  {member.name}
                </option>
              ))}
            </select>
          </div>

          <div className="tasks-filter-field">
            <label>
              <CalendarDays size={14} />
              Due date
            </label>

            <select
              value={dueDateFilter}
              onChange={(event) =>
                setDueDateFilter(event.target.value)
              }
            >
              <option value="all">
                All dates
              </option>
              <option value="today">
                Due today
              </option>
              <option value="overdue">
                Overdue
              </option>
              <option value="upcoming">
                Upcoming
              </option>
            </select>
          </div>
        </div>
      )}

      <div className="tasks-result-info">
        <span>
          Showing{" "}
          <strong>{filteredTasks.length}</strong>{" "}
          of <strong>{tasks.length}</strong> tasks
        </span>
      </div>

      {filteredTasks.length > 0 ? (
        <TaskBoard
          tasks={filteredTasks}
          onTaskMove={handleTaskMove}
          onTaskEdit={handleEditTask}
          onTaskDelete={handleDeleteTask}
          onTaskView={setViewingTask}
        />
      ) : (
        <div className="tasks-empty-state">
          <div className="tasks-empty-icon">
            <Search size={22} />
          </div>

          <h2>
            {hasActiveFilters
              ? "No matching tasks"
              : "No tasks yet"}
          </h2>

          <p>
            {hasActiveFilters
              ? "Try changing your search or filters."
              : "Create your first task to start managing work."}
          </p>

          {hasActiveFilters ? (
            <Button
              variant="secondary"
              onClick={clearFilters}
            >
              Clear filters
            </Button>
          ) : (
            <Button onClick={handleCreateTask}>
              <Plus size={17} />
              Create Task
            </Button>
          )}
        </div>
      )}

      <TaskModal
        key={editingTask?._id || "new"}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={handleTaskSaved}
        task={editingTask}
        projects={projects}
      />
<TaskDetails
  task={viewingTask}
  open={Boolean(viewingTask)}
  onClose={() => setViewingTask(null)}
  onEdit={handleEditTask}
  onDelete={handleDeleteTask}
/>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}

export default Tasks;