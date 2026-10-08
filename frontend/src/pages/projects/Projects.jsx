import { useEffect, useState } from "react";
import {
  Plus,
  FolderKanban,
  CalendarDays,
  RefreshCw,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Spinner from "../../components/ui/Spinner";
import Input from "../../components/ui/Input";

import "./Projects.css";



function Projects() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);

  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const [showForm, setShowForm] = useState(false);

  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");

  const [form, setForm] = useState({
    name: "",
    description: "",
    status: "planning",
    priority: "medium",
    startDate: "",
    dueDate: "",
  });

  const fetchProjects = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/projects");

      setProjects(response.data.projects || []);
    } catch (err) {
      console.error("Projects fetch error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load projects."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    const loadProjects = async () => {
      try {
        const response = await api.get("/projects");

        if (!cancelled) {
          setProjects(response.data.projects || []);
          setError("");
          setLoading(false);
        }
      } catch (err) {
        console.error("Projects fetch error:", err);

        if (!cancelled) {
          setError(
            err.response?.data?.message ||
              "Unable to load projects."
          );
          setLoading(false);
        }
      }
    };

    loadProjects();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });

    if (formError) {
      setFormError("");
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();

    setFormError("");

    if (!form.name.trim()) {
      setFormError("Project name is required.");
      return;
    }

    setCreating(true);

    try {
      await api.post("/projects", {
        name: form.name,
        description: form.description,
        status: form.status,
        priority: form.priority,
        startDate: form.startDate || null,
        dueDate: form.dueDate || null,
      });

      setForm({
        name: "",
        description: "",
        status: "planning",
        priority: "medium",
        startDate: "",
        dueDate: "",
      });

      setShowForm(false);

      await fetchProjects();
    } catch (err) {
      console.error("Create project error:", err);

      setFormError(
        err.response?.data?.message ||
          "Unable to create project."
      );
    } finally {
      setCreating(false);
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

  return (

      <div className="projects-page">
        <section className="projects-header">
          <div>
            <p className="projects-eyebrow">
              PROJECT MANAGEMENT
            </p>

            <h1>Projects</h1>

            <p>
              Manage your workspace projects and track
              their progress.
            </p>
          </div>

          <div className="projects-actions">
            <Button
              variant="secondary"
              onClick={fetchProjects}
              disabled={loading}
            >
              <RefreshCw size={15} />
              Refresh
            </Button>

            <Button
              onClick={() => {
                setShowForm(!showForm);
                setFormError("");
              }}
            >
              <Plus size={17} />
              New project
            </Button>
          </div>
        </section>

        {showForm && (
          <Card className="project-form-card">
            <div className="project-form-heading">
              <div>
                <h2>Create project</h2>
                <p>
                  Add a new project to your workspace.
                </p>
              </div>
            </div>

            <form
              className="project-form"
              onSubmit={handleCreateProject}
            >
              <Input
                label="Project name"
                name="name"
                placeholder="e.g. Website Redesign"
                value={form.name}
                onChange={handleChange}
                required
              />

              <div className="project-field">
                <label>Description</label>

                <textarea
                  name="description"
                  placeholder="Describe the project..."
                  value={form.description}
                  onChange={handleChange}
                />
              </div>

              <div className="project-form-grid">
                <div className="project-field">
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

                <div className="project-field">
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

                <div className="project-field">
                  <label>Start date</label>

                  <input
                    type="date"
                    name="startDate"
                    value={form.startDate}
                    onChange={handleChange}
                  />
                </div>

                <div className="project-field">
                  <label>Due date</label>

                  <input
                    type="date"
                    name="dueDate"
                    value={form.dueDate}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {formError && (
                <p className="project-form-error">
                  {formError}
                </p>
              )}

              <div className="project-form-actions">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  loading={creating}
                  disabled={creating}
                >
                  Create project
                </Button>
              </div>
            </form>
          </Card>
        )}

        {loading ? (
          <div className="projects-loading">
            <Spinner />
            <p>Loading projects...</p>
          </div>
        ) : error ? (
          <Card className="projects-message">
            <p>{error}</p>

            <Button onClick={fetchProjects}>
              Try again
            </Button>
          </Card>
        ) : projects.length === 0 ? (
          <Card className="projects-empty">
            <div className="projects-empty-icon">
              <FolderKanban size={25} />
            </div>

            <h2>No projects yet</h2>

            <p>
              Create your first project to start managing
              your work.
            </p>

            <Button onClick={() => setShowForm(true)}>
              <Plus size={16} />
              Create project
            </Button>
          </Card>
        ) : (
          <div className="projects-grid">
            {projects.map((project) => (
              <Card
                key={project._id}
                className="project-card"
                 onClick={() =>
      navigate(`/projects/${project._id}`)
    }
              >
                <div className="project-card-top">
                  <div className="project-card-icon">
                    <FolderKanban size={19} />
                  </div>

                  <Badge
                    variant={getStatusVariant(
                      project.status
                    )}
                  >
                    {project.status.replace("_", " ")}
                  </Badge>
                </div>

                <h2>{project.name}</h2>

                <p className="project-description">
                  {project.description ||
                    "No description provided."}
                </p>

                <div className="project-progress">
                  <div className="project-progress-header">
                    <span>Progress</span>
                    <strong>
                      {project.progress || 0}%
                    </strong>
                  </div>

                  <div className="project-progress-track">
                    <div
                      className="project-progress-bar"
                      style={{
                        width: `${project.progress || 0}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="project-card-footer">
                  <span>
                    <CalendarDays size={14} />

                    {project.dueDate
                      ? new Date(
                          project.dueDate
                        ).toLocaleDateString()
                      : "No deadline"}
                  </span>

                  <Badge variant="default">
                    {project.priority}
                  </Badge>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    
  );
}

export default Projects;