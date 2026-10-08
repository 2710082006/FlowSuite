import { useEffect, useState } from "react";

import api from "../../services/api";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Card from "../../components/ui/Card";
import Spinner from "../../components/ui/Spinner";

import "./WorkspaceSettings.css";

function WorkspaceSettings() {
  const [form, setForm] = useState({
    name: "",
    slug: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchWorkspace = async () => {
      try {
        const response = await api.get("/workspace");

        const workspace = response.data.workspace;

        setForm({
          name: workspace.name || "",
          slug: workspace.slug || "",
        });
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Unable to load workspace"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchWorkspace();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!form.name.trim()) {
      setError("Workspace name is required");
      return;
    }

    if (!form.slug.trim()) {
      setError("Workspace slug is required");
      return;
    }

    try {
      setSaving(true);

      const response = await api.put(
        "/workspace/settings",
        {
          name: form.name.trim(),
          slug: form.slug.trim(),
        }
      );

      const workspace = response.data.workspace;

      setForm({
        name: workspace.name || "",
        slug: workspace.slug || "",
      });

      setSuccess(
        "Workspace settings updated successfully"
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to update workspace"
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="workspace-loading">
        <Spinner />
        <p>Loading workspace...</p>
      </div>
    );
  }

  return (
    <div className="workspace-settings-page">
      <div className="workspace-settings-header">
        <div>
          <p className="workspace-eyebrow">SETTINGS</p>

          <h1>Workspace</h1>

          <p>
            Manage your workspace information and
            identification.
          </p>
        </div>
      </div>

      <Card className="workspace-card">
        <form onSubmit={handleSubmit}>
          <Input
            label="Workspace name"
            name="name"
            placeholder="Enter workspace name"
            value={form.name}
            onChange={handleChange}
            required
          />

          <Input
            label="Workspace slug"
            name="slug"
            placeholder="my-workspace"
            value={form.slug}
            onChange={handleChange}
            required
          />

          <p className="workspace-slug-help">
            The slug is used as the unique identifier
            for your workspace.
          </p>

          {error && (
            <div className="workspace-message workspace-message-error">
              {error}
            </div>
          )}

          {success && (
            <div className="workspace-message workspace-message-success">
              {success}
            </div>
          )}

          <div className="workspace-actions">
            <Button
              type="submit"
              loading={saving}
            >
              Save changes
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

export default WorkspaceSettings;