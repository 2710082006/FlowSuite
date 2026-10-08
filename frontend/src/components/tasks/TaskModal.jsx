import { useEffect, useState } from "react";
import { X } from "lucide-react";
import api from "../../services/api";
import Button from "../ui/Button";
import Input from "../ui/Input";
import "./TaskModal.css";

const getInitialForm = (task) => ({
  title: task?.title || "",
  description: task?.description || "",
  project: task?.project?._id || task?.project || "",
  assignee: task?.assignee?._id || task?.assignee || "",
  status: task?.status || "todo",
  priority: task?.priority || "medium",
  dueDate: task?.dueDate
    ? task.dueDate.split("T")[0]
    : "",
  estimatedHours: task?.estimatedHours ?? "",
  tags: Array.isArray(task?.tags)
    ? task.tags.join(", ")
    : "",
});

function TaskModal({
  open,
  onClose,
  onSaved,
  task = null,
  projects = [],
}) {
  const [form, setForm] = useState(() =>
    getInitialForm(task)
  );

  const [members, setMembers] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const isEditMode = Boolean(task);

  useEffect(() => {
    if (!open) {
      return;
    }

    let cancelled = false;

    const loadMembers = async () => {
      try {
        const response = await api.get("/team");

        if (!cancelled) {
          setMembers(response.data.members || []);
        }
      } catch (error) {
        console.error(
          "Failed to load team members:",
          error
        );

        if (!cancelled) {
          setError(
            error.response?.data?.message ||
              "Failed to load team members"
          );
        }
      }
    };

    loadMembers();

    return () => {
      cancelled = true;
    };
  }, [open]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.title.trim()) {
      setError("Task title is required");
      return;
    }

    if (!form.project) {
      setError("Project is required");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        project: form.project,
        assignee: form.assignee || null,
        status: form.status,
        priority: form.priority,
        dueDate: form.dueDate || null,
        estimatedHours: form.estimatedHours
          ? Number(form.estimatedHours)
          : 0,
        tags: form.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
      };

      let response;

      if (isEditMode) {
        response = await api.put(
          `/tasks/${task._id}`,
          payload
        );
      } else {
        response = await api.post(
          "/tasks",
          payload
        );
      }

      onSaved(response.data.task);
      onClose();
    } catch (error) {
      console.error(
        "Failed to save task:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to save task"
      );
    } finally {
      setSaving(false);
    }
  };

  if (!open) {
    return null;
  }

  return (
    <div
      className="task-modal-overlay"
      onMouseDown={onClose}
    >
      <div
        className="task-modal"
        onMouseDown={(event) =>
          event.stopPropagation()
        }
      >
        <div className="task-modal-header">
          <div>
            <h2>
              {isEditMode
                ? "Edit Task"
                : "Create Task"}
            </h2>

            <p>
              {isEditMode
                ? "Update task details and assignment."
                : "Create a task and assign it to your team."}
            </p>
          </div>

          <button
            type="button"
            className="task-modal-close"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>

        <form
          className="task-modal-form"
          onSubmit={handleSubmit}
        >
          {error && (
            <div className="task-modal-error">
              {error}
            </div>
          )}

          <Input
            label="Task title"
            name="title"
            placeholder="Enter task title"
            value={form.title}
            onChange={handleChange}
            required
          />

          <div className="task-modal-field">
            <label>Description</label>

            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Describe the task..."
              rows={4}
            />
          </div>

          <div className="task-modal-grid">
            <div className="task-modal-field">
              <label>
                Project <span>*</span>
              </label>

              <select
                name="project"
                value={form.project}
                onChange={handleChange}
              >
                <option value="">
                  Select project
                </option>

                {projects.map((project) => (
                  <option
                    key={project._id}
                    value={project._id}
                  >
                    {project.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="task-modal-field">
              <label>Assignee</label>

              <select
                name="assignee"
                value={form.assignee}
                onChange={handleChange}
              >
                <option value="">
                  Unassigned
                </option>

                {members.map((member) => (
                  <option
                    key={member.user._id}
                    value={member.user._id}
                  >
                    {member.user?.name} · {member.user?.role}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="task-modal-grid">
            <div className="task-modal-field">
              <label>Status</label>

              <select
                name="status"
                value={form.status}
                onChange={handleChange}
              >
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

            <div className="task-modal-field">
              <label>Priority</label>

              <select
                name="priority"
                value={form.priority}
                onChange={handleChange}
              >
                <option value="low">Low</option>
                <option value="medium">
                  Medium
                </option>
                <option value="high">High</option>
                <option value="critical">
                  Critical
                </option>
              </select>
            </div>
          </div>

          <div className="task-modal-grid">
            <Input
              label="Due date"
              type="date"
              name="dueDate"
              value={form.dueDate}
              onChange={handleChange}
            />

            <Input
              label="Estimated hours"
              type="number"
              name="estimatedHours"
              placeholder="e.g. 4"
              value={form.estimatedHours}
              onChange={handleChange}
            />
          </div>

          <Input
            label="Tags"
            name="tags"
            placeholder="frontend, urgent, client"
            value={form.tags}
            onChange={handleChange}
          />

          <div className="task-modal-footer">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              loading={saving}
            >
              {isEditMode
                ? "Save Changes"
                : "Create Task"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TaskModal;