import { useEffect, useState } from "react";
import api from "../../services/api";
import { useAuth } from "../../context/useAuth";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Spinner from "../../components/ui/Spinner";

import "./ProfileSettings.css";

function ProfileSettings() {
  const { user } = useAuth();

  const [form, setForm] = useState({
    name: "",
    email: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get("/auth/profile");

        const profile = response.data.user;

        setForm({
          name: profile.name || "",
          email: profile.email || "",
        });
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Unable to load profile"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
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
      setError("Name is required");
      return;
    }

    if (!form.email.trim()) {
      setError("Email is required");
      return;
    }

    try {
      setSaving(true);

      const response = await api.put(
        "/auth/profile",
        {
          name: form.name.trim(),
          email: form.email.trim(),
        }
      );

      const updatedUser = response.data.user;

      localStorage.setItem(
        "flowsuite_user",
        JSON.stringify({
          id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role,
          workspaceId:
            updatedUser.workspace?._id ||
            user?.workspaceId,
        })
      );

      setForm({
        name: updatedUser.name || "",
        email: updatedUser.email || "",
      });

      setSuccess("Profile updated successfully");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to update profile"
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="profile-loading">
        <Spinner />
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="profile-settings-page">
      <div className="profile-settings-header">
        <div>
          <p className="profile-eyebrow">SETTINGS</p>
          <h1>Profile</h1>
          <p>
            Manage your personal account information.
          </p>
        </div>
      </div>

      <Card className="profile-card">
        <form onSubmit={handleSubmit}>
          <Input
            label="Full name"
            name="name"
            placeholder="Enter your name"
            value={form.name}
            onChange={handleChange}
            required
          />

          <Input
            label="Email address"
            type="email"
            name="email"
            placeholder="Enter your email"
            value={form.email}
            onChange={handleChange}
            required
          />

          {error && (
            <div className="profile-message profile-message-error">
              {error}
            </div>
          )}

          {success && (
            <div className="profile-message profile-message-success">
              {success}
            </div>
          )}

          <div className="profile-actions">
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

export default ProfileSettings;