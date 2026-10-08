import { useState } from "react";

import api from "../../services/api";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";

import "./SecuritySettings.css";

function SecuritySettings() {
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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

    if (!form.currentPassword) {
      setError("Current password is required");
      return;
    }

    if (!form.newPassword) {
      setError("New password is required");
      return;
    }

    if (form.newPassword.length < 6) {
      setError(
        "New password must be at least 6 characters long"
      );
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    if (form.currentPassword === form.newPassword) {
      setError(
        "New password must be different from current password"
      );
      return;
    }

    try {
      setSaving(true);

      const response = await api.put(
        "/auth/change-password",
        {
          currentPassword: form.currentPassword,
          newPassword: form.newPassword,
        }
      );

      setSuccess(
        response.data.message ||
          "Password changed successfully"
      );

      setForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to change password"
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="security-settings-page">
      <div className="security-settings-header">
        <p className="security-eyebrow">SETTINGS</p>

        <h1>Password & Security</h1>

        <p>
          Update your password to keep your account secure.
        </p>
      </div>

      <Card className="security-card">
        <form onSubmit={handleSubmit}>
          <Input
            label="Current password"
            type="password"
            name="currentPassword"
            placeholder="Enter your current password"
            value={form.currentPassword}
            onChange={handleChange}
            required
          />

          <Input
            label="New password"
            type="password"
            name="newPassword"
            placeholder="Enter your new password"
            value={form.newPassword}
            onChange={handleChange}
            required
          />

          <Input
            label="Confirm new password"
            type="password"
            name="confirmPassword"
            placeholder="Confirm your new password"
            value={form.confirmPassword}
            onChange={handleChange}
            required
          />

          <p className="security-password-help">
            Password must be at least 6 characters long.
          </p>

          {error && (
            <div className="security-message security-message-error">
              {error}
            </div>
          )}

          {success && (
            <div className="security-message security-message-success">
              {success}
            </div>
          )}

          <div className="security-actions">
            <Button
              type="submit"
              loading={saving}
            >
              Change password
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

export default SecuritySettings;