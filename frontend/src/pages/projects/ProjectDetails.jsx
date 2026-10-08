import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  UserRound,
  RefreshCw,
  FolderKanban,
  X,
  Save,
} from "lucide-react";

import api from "../../services/api";
import DashboardLayout from "../../layouts/DashboardLayout";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Spinner from "../../components/ui/Spinner";
import Input from "../../components/ui/Input";

import "./ProjectDetails.css";

function ProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
const [deleting, setDeleting] = useState(false);
const [showDeleteConfirm, setShowDeleteConfirm] =
  useState(false);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");

  const [showEditForm, setShowEditForm] = useState(false);

  const [form, setForm] = useState({
    name: "",
    description: "",
    status: "planning",
    priority: "medium",
    startDate: "",
    dueDate: "",
    progress: 0,
  });

  const fetchProject = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get(`/projects/${id}`);

      setProject(response.data.project);
    } catch (err) {
      console.error("Project fetch error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load project."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    const loadProject = async () => {
      try {
        const response = await api.get(`/projects/${id}`);

        if (!cancelled) {
          setProject(response.data.project);
          setError("");
          setLoading(false);
        }
      } catch (err) {
        console.error("Project fetch error:", err);

        if (!cancelled) {
          setError(
            err.response?.data?.message ||
              "Unable to load project."
          );
          setLoading(false);
        }
      }
    };

    loadProject();

    return () => {
      cancelled = true;
    };
  }, [id]);

  const openEditForm = () => {
    setForm({
      name: project.name || "",
      description: project.description || "",
      status: project.status || "planning",
      priority: project.priority || "medium",
      startDate: project.startDate
        ? project.startDate.slice(0, 10)
        : "",
      dueDate: project.dueDate
        ? project.dueDate.slice(0, 10)
        : "",
      progress: project.progress || 0,
    });

    setFormError("");
    setShowEditForm(true);
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });

    if (formError) {
      setFormError("");
    }
  };

  const handleUpdateProject = async (e) => {
    e.preventDefault();

    setFormError("");

    if (!form.name.trim()) {
      setFormError("Project name is required.");
      return;
    }

    const progress = Number(form.progress);

    if (progress < 0 || progress > 100) {
      setFormError(
        "Progress must be between 0 and 100."
      );
      return;
    }

    setSaving(true);

    try {
      const response = await api.put(`/projects/${id}`, {
        name: form.name.trim(),
        description: form.description,
        status: form.status,
        priority: form.priority,
        startDate: form.startDate || null,
        dueDate: form.dueDate || null,
        progress,
      });

      setProject(response.data.project);

      setShowEditForm(false);
      setFormError("");
    } catch (err) {
      console.error("Update project error:", err);

      setFormError(
        err.response?.data?.message ||
          "Unable to update project."
      );
    } finally {
      setSaving(false);
    }
  };

const handleDeleteProject = async () => {
  setDeleting(true);

  try {
    await api.delete(`/projects/${id}`);

    navigate("/projects");
  } catch (err) {
    console.error("Delete project error:", err);

    setError(
      err.response?.data?.message ||
        "Unable to delete project."
    );

    setDeleting(false);
    setShowDeleteConfirm(false);
  }
};

  const getStatusVariant = (status) => {
    const variants = {
      planning: "info",
      active: "success",
      on_hold: "warning",
      completed: "default",
    };

    return variants[status] || "default";
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="project-details-loading">
          <Spinner />
          <p>Loading project...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !project) {
    return (
      <DashboardLayout>
        <div className="project-details-error">
          <Card>
            <h2>Unable to load project</h2>

            <p>
              {error || "Project not found."}
            </p>

            <div className="project-details-error-actions">
              <Button
                variant="secondary"
                onClick={() =>
                  navigate("/projects")
                }
              >
                Back to projects
              </Button>

              <Button onClick={fetchProject}>
                <RefreshCw size={15} />
                Try again
              </Button>
            </div>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="project-details-page">

        <div className="project-details-topbar">
          <Button
            variant="secondary"
            onClick={() =>
              navigate("/projects")
            }
          >
            <ArrowLeft size={16} />
            Projects
          </Button>
        </div>

        <section className="project-details-header">
          <div className="project-details-title">

            <div className="project-details-icon">
              <FolderKanban size={22} />
            </div>

            <div>
              <p className="project-details-eyebrow">
                PROJECT
              </p>

              <h1>{project.name}</h1>

              <p>
                {project.description ||
                  "No description provided."}
              </p>
            </div>

          </div>

          <div className="project-details-actions">

            <Button
              variant="secondary"
              onClick={openEditForm}
            >
              Edit project
            </Button>

            <Button variant="danger"   onClick={() => setShowDeleteConfirm(true)}>
              Delete
            </Button>

          </div>
        </section>

        {showEditForm && (
          <Card className="project-edit-card">

            <div className="project-edit-header">
              <div>
                <h2>Edit project</h2>

                <p>
                  Update your project information.
                </p>
              </div>

              <button
                type="button"
                className="project-edit-close"
                onClick={() =>
                  setShowEditForm(false)
                }
                aria-label="Close edit form"
              >
                <X size={18} />
              </button>
            </div>

            <form
              className="project-edit-form"
              onSubmit={handleUpdateProject}
            >

              <Input
                label="Project name"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
              />

              <div className="project-edit-field">
                <label>Description</label>

                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Describe the project..."
                />
              </div>

              <div className="project-edit-grid">

                <div className="project-edit-field">
                  <label>Status</label>

                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                  >
                    <option value="planning">
                      Planning
                    </option>

                    <option value="active">
                      Active
                    </option>

                    <option value="on_hold">
                      On hold
                    </option>

                    <option value="completed">
                      Completed
                    </option>
                  </select>
                </div>

                <div className="project-edit-field">
                  <label>Priority</label>

                  <select
                    name="priority"
                    value={form.priority}
                    onChange={handleChange}
                  >
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

                <div className="project-edit-field">
                  <label>Start date</label>

                  <input
                    type="date"
                    name="startDate"
                    value={form.startDate}
                    onChange={handleChange}
                  />
                </div>

                <div className="project-edit-field">
                  <label>Due date</label>

                  <input
                    type="date"
                    name="dueDate"
                    value={form.dueDate}
                    onChange={handleChange}
                  />
                </div>

              </div>

              <div className="project-edit-field">
                <label>
                  Progress — {form.progress}%
                </label>

                <input
                  type="range"
                  name="progress"
                  min="0"
                  max="100"
                  value={form.progress}
                  onChange={handleChange}
                />
              </div>

              {formError && (
                <p className="project-edit-error">
                  {formError}
                </p>
              )}

              <div className="project-edit-actions">

                <Button
                  type="button"
                  variant="secondary"
                  onClick={() =>
                    setShowEditForm(false)
                  }
                  disabled={saving}
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  loading={saving}
                  disabled={saving}
                >
                  {!saving && (
                    <Save size={16} />
                  )}

                  Save changes
                </Button>

              </div>

            </form>
          </Card>
        )}

{showDeleteConfirm && (
  <div className="delete-modal-overlay">
    <div className="delete-modal">

      <div className="delete-modal-icon">
        !
      </div>

      <h2>Delete project?</h2>

      <p>
        You are about to permanently delete{" "}
        <strong>{project.name}</strong>.
        This action cannot be undone.
      </p>

      <div className="delete-modal-actions">
        <Button
          variant="secondary"
          onClick={() =>
            setShowDeleteConfirm(false)
          }
          disabled={deleting}
        >
          Cancel
        </Button>

        <Button
          variant="danger"
          onClick={handleDeleteProject}
          loading={deleting}
          disabled={deleting}
        >
          Delete project
        </Button>
      </div>

    </div>
  </div>
)}

        <div className="project-details-grid">

          <Card className="project-overview-card">

            <div className="project-section-heading">
              <h2>Project overview</h2>

              <Badge
                variant={getStatusVariant(
                  project.status
                )}
              >
                {project.status.replace(
                  "_",
                  " "
                )}
              </Badge>
            </div>

            <div className="project-info-grid">

              <div className="project-info-item">
                <span>Status</span>

                <strong>
                  {project.status.replace(
                    "_",
                    " "
                  )}
                </strong>
              </div>

              <div className="project-info-item">
                <span>Priority</span>

                <strong>
                  {project.priority}
                </strong>
              </div>

              <div className="project-info-item">
                <span>Start date</span>

                <strong>
                  {project.startDate
                    ? new Date(
                        project.startDate
                      ).toLocaleDateString()
                    : "Not set"}
                </strong>
              </div>

              <div className="project-info-item">
                <span>Due date</span>

                <strong>
                  {project.dueDate
                    ? new Date(
                        project.dueDate
                      ).toLocaleDateString()
                    : "No deadline"}
                </strong>
              </div>

            </div>

          </Card>

          <Card className="project-progress-card">

            <div className="project-section-heading">
              <h2>Progress</h2>

              <strong className="project-progress-value">
                {project.progress || 0}%
              </strong>
            </div>

            <div className="project-large-progress">
              <div
                className="project-large-progress-bar"
                style={{
                  width: `${project.progress || 0}%`,
                }}
              />
            </div>

            <p>
              Project progress is currently at{" "}
              <strong>
                {project.progress || 0}%
              </strong>
              .
            </p>

          </Card>

          <Card className="project-owner-card">

            <div className="project-section-heading">
              <h2>Project owner</h2>
            </div>

            <div className="project-owner">

              <div className="project-owner-avatar">
                <UserRound size={19} />
              </div>

              <div>
                <strong>
                  {project.owner?.name ||
                    "Unknown"}
                </strong>

                <span>
                  {project.owner?.email ||
                    "No email available"}
                </span>
              </div>

            </div>

          </Card>

          <Card className="project-dates-card">

            <div className="project-section-heading">
              <h2>Timeline</h2>
            </div>

            <div className="project-timeline-item">
              <CalendarDays size={17} />

              <div>
                <span>Created</span>

                <strong>
                  {new Date(
                    project.createdAt
                  ).toLocaleDateString()}
                </strong>
              </div>
            </div>

            <div className="project-timeline-item">
              <CalendarDays size={17} />

              <div>
                <span>Last updated</span>

                <strong>
                  {new Date(
                    project.updatedAt
                  ).toLocaleDateString()}
                </strong>
              </div>
            </div>

          </Card>

        </div>
      </div>
    </DashboardLayout>
  );
}

export default ProjectDetails;