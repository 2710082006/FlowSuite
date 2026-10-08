import { useEffect, useState } from "react";

import api from "../../services/api";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Spinner from "../../components/ui/Spinner";

import "./PreferencesSettings.css";

function PreferencesSettings() {
  const [preferences, setPreferences] = useState({
    theme: "light",
    emailNotifications: true,
    taskNotifications: true,
    teamNotifications: true,
    systemNotifications: true,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        const response = await api.get("/auth/preferences");

        setPreferences({
          theme: response.data.preferences?.theme || "light",
          emailNotifications:
            response.data.preferences?.emailNotifications ?? true,
          taskNotifications:
            response.data.preferences?.taskNotifications ?? true,
          teamNotifications:
            response.data.preferences?.teamNotifications ?? true,
          systemNotifications:
            response.data.preferences?.systemNotifications ?? true,
        });
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Unable to load preferences"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPreferences();
  }, []);

  const handleToggle = (name) => {
    setPreferences((previous) => ({
      ...previous,
      [name]: !previous[name],
    }));
  };

  const handleThemeChange = (e) => {
    setPreferences((previous) => ({
      ...previous,
      theme: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    try {
      setSaving(true);

      const response = await api.put(
        "/auth/preferences",
        preferences
      );

      setPreferences(response.data.preferences);

      setSuccess(
        response.data.message ||
          "Preferences updated successfully"
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to update preferences"
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="preferences-loading">
        <Spinner />
        <p>Loading preferences...</p>
      </div>
    );
  }

  return (
    <div className="preferences-settings-page">
      <div className="preferences-settings-header">
        <p className="preferences-eyebrow">SETTINGS</p>

        <h1>Preferences</h1>

        <p>
          Customize your FlowSuite experience and
          notification preferences.
        </p>
      </div>

      <Card className="preferences-card">
        <form onSubmit={handleSubmit}>
          <div className="preferences-section">
            <div className="preferences-section-header">
              <h2>Appearance</h2>
              <p>
                Choose how FlowSuite should appear.
              </p>
            </div>

            <div className="preferences-field">
              <label htmlFor="theme">Theme</label>

              <select
                id="theme"
                value={preferences.theme}
                onChange={handleThemeChange}
                className="preferences-select"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="system">System</option>
              </select>
            </div>
          </div>

          <div className="preferences-divider" />

          <div className="preferences-section">
            <div className="preferences-section-header">
              <h2>Notifications</h2>
              <p>
                Choose which notifications you want to
                receive.
              </p>
            </div>

            <PreferenceToggle
              label="Email notifications"
              description="Receive important FlowSuite updates by email."
              checked={preferences.emailNotifications}
              onChange={() =>
                handleToggle("emailNotifications")
              }
            />

            <PreferenceToggle
              label="Task notifications"
              description="Receive notifications about assigned and updated tasks."
              checked={preferences.taskNotifications}
              onChange={() =>
                handleToggle("taskNotifications")
              }
            />

            <PreferenceToggle
              label="Team notifications"
              description="Receive notifications about team activity."
              checked={preferences.teamNotifications}
              onChange={() =>
                handleToggle("teamNotifications")
              }
            />

            <PreferenceToggle
              label="System notifications"
              description="Receive important system and workspace notifications."
              checked={preferences.systemNotifications}
              onChange={() =>
                handleToggle("systemNotifications")
              }
            />
          </div>

          {error && (
            <div className="preferences-message preferences-message-error">
              {error}
            </div>
          )}

          {success && (
            <div className="preferences-message preferences-message-success">
              {success}
            </div>
          )}

          <div className="preferences-actions">
            <Button
              type="submit"
              loading={saving}
            >
              Save preferences
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

function PreferenceToggle({
  label,
  description,
  checked,
  onChange,
}) {
  return (
    <div className="preference-toggle-row">
      <div className="preference-toggle-content">
        <strong>{label}</strong>
        <span>{description}</span>
      </div>

      <button
        type="button"
        className={`preference-toggle ${
          checked ? "preference-toggle-active" : ""
        }`}
        onClick={onChange}
        aria-pressed={checked}
      >
        <span className="preference-toggle-knob" />
      </button>
    </div>
  );
}

export default PreferencesSettings;