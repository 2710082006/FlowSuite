import { useEffect, useState } from "react";

import api from "../../services/api";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Badge from "../../components/ui/Badge";

import "./Team.css";

function Team() {
  const [members, setMembers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");

  const [showForm, setShowForm] = useState(false);

  const [actionMember, setActionMember] = useState(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);

  const [selectedRole, setSelectedRole] = useState("member");
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");

  const [search, setSearch] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "member",
  });

  useEffect(() => {
    let cancelled = false;

    const loadTeam = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/team");

        if (cancelled) return;

        setMembers(response.data.members || []);
      } catch (err) {
        if (cancelled) return;

        console.error("Failed to load team:", err);

        setError(
          err.response?.data?.message ||
            "Failed to load team members"
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadTeam();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleAddMember = async (event) => {
    event.preventDefault();

    setFormError("");

    if (!form.name.trim()) {
      setFormError("Name is required");
      return;
    }

    if (!form.email.trim()) {
      setFormError("Email is required");
      return;
    }

    if (form.password.length < 6) {
      setFormError(
        "Password must be at least 6 characters"
      );
      return;
    }

    try {
      setSaving(true);

      const response = await api.post("/team", {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        role: form.role,
      });

      setMembers((previous) => [
        ...previous,
        response.data.member,
      ]);

      setForm({
        name: "",
        email: "",
        password: "",
        role: "member",
      });

      setShowForm(false);
    } catch (err) {
      console.error(
        "Add team member error:",
        err
      );

      setFormError(
        err.response?.data?.message ||
          "Failed to add team member"
      );
    } finally {
      setSaving(false);
    }
  };

  const openRoleModal = (member) => {
    setActionMember(member);
    setSelectedRole(member.role);
    setActionError("");
    setShowRoleModal(true);
  };

  const openRemoveModal = (member) => {
    setActionMember(member);
    setActionError("");
    setShowRemoveModal(true);
  };

  const closeActionModals = () => {
    if (actionLoading) return;

    setActionMember(null);
    setShowRoleModal(false);
    setShowRemoveModal(false);
    setActionError("");
  };

  const handleRoleUpdate = async () => {
    if (!actionMember) return;

    try {
      setActionLoading(true);
      setActionError("");

      const response = await api.put(
        `/team/${actionMember._id}/role`,
        {
          role: selectedRole,
        }
      );

      setMembers((previous) =>
        previous.map((member) =>
          member._id === actionMember._id
            ? response.data.member
            : member
        )
      );

      setActionMember(null);
      setShowRoleModal(false);
      setShowRemoveModal(false);
      setActionError("");
    } catch (err) {
      console.error(
        "Update member role error:",
        err
      );

      setActionError(
        err.response?.data?.message ||
          "Failed to update member role"
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveMember = async () => {
    if (!actionMember) return;

    try {
      setActionLoading(true);
      setActionError("");

      await api.delete(
        `/team/${actionMember._id}`
      );

      setMembers((previous) =>
        previous.filter(
          (member) =>
            member._id !== actionMember._id
        )
      );

      setActionMember(null);
      setShowRoleModal(false);
      setShowRemoveModal(false);
      setActionError("");
    } catch (err) {
      console.error(
        "Remove member error:",
        err
      );

      setActionError(
        err.response?.data?.message ||
          "Failed to remove member"
      );
    } finally {
      setActionLoading(false);
    }
  };

  const getRoleVariant = (role) => {
    switch (role) {
      case "owner":
        return "default";

      case "admin":
        return "danger";

      case "manager":
        return "warning";

      case "member":
        return "info";

      default:
        return "default";
    }
  };

  const getStatusVariant = (status) => {
    return status === "active"
      ? "success"
      : "danger";
  };

  const filteredMembers = members.filter(
    (member) => {
      const name =
        member.user?.name?.toLowerCase() || "";

      const email =
        member.user?.email?.toLowerCase() || "";

      const query = search.toLowerCase();

      return (
        name.includes(query) ||
        email.includes(query)
      );
    }
  );

  if (loading) {
    return (
      <div className="team-page">
        <div className="team-loading">
          Loading team...
        </div>
      </div>
    );
  }

  return (
    <div className="team-page">
      <div className="team-header">
        <div>
          <span className="team-eyebrow">
            WORKSPACE
          </span>

          <h1>Team Members</h1>

          <p>
            Manage your workspace members,
            roles and access.
          </p>
        </div>

        <Button
          onClick={() => {
            setFormError("");
            setShowForm(true);
          }}
        >
          + Add Member
        </Button>
      </div>

      {error && (
        <div className="team-error">
          {error}
        </div>
      )}

      <div className="team-toolbar">
        <div className="team-search">
          <Input
            placeholder="Search by name or email..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />
        </div>

        <div className="team-count">
          <strong>{members.length}</strong>

          <span>
            {members.length === 1
              ? " member"
              : " members"}
          </span>
        </div>
      </div>

      <div className="team-table-wrapper">
        <table className="team-table">
          <thead>
            <tr>
              <th>Member</th>
              <th>Role</th>
              <th>Status</th>
              <th>Joined</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {filteredMembers.length > 0 ? (
              filteredMembers.map((member) => (
                <tr key={member._id}>
                  <td>
                    <div className="team-member">
                      <div className="team-avatar">
                        {member.user?.name
                          ?.charAt(0)
                          ?.toUpperCase() || "U"}
                      </div>

                      <div>
                        <div className="team-member-name">
                          {member.user?.name ||
                            "Unknown User"}
                        </div>

                        <div className="team-member-email">
                          {member.user?.email ||
                            "No email"}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td>
                    <Badge
                      variant={getRoleVariant(
                        member.role
                      )}
                    >
                      {member.role}
                    </Badge>
                  </td>

                  <td>
                    <Badge
                      variant={getStatusVariant(
                        member.status
                      )}
                    >
                      {member.status}
                    </Badge>
                  </td>

                  <td>
                    <span className="team-date">
                      {member.joinedAt
                        ? new Date(
                            member.joinedAt
                          ).toLocaleDateString(
                            "en-IN",
                            {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            }
                          )
                        : "—"}
                    </span>
                  </td>

                  <td>
                    <div className="team-actions">
                      <button
                        type="button"
                        className="team-action-button"
                        onClick={() =>
                          openRoleModal(member)
                        }
                      >
                        Edit
                      </button>

                      {member.role !== "owner" && (
                        <button
                          type="button"
                          className="team-action-remove"
                          onClick={() =>
                            openRemoveModal(member)
                          }
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="5"
                  className="team-empty"
                >
                  {search
                    ? "No members found"
                    : "No team members found"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ================================
          ADD MEMBER MODAL
      ================================= */}

      {showForm && (
        <div
          className="team-modal-overlay"
          onClick={() => setShowForm(false)}
        >
          <div
            className="team-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="team-modal-header">
              <div>
                <h2>Add Team Member</h2>

                <p>
                  Create a new member for this
                  workspace.
                </p>
              </div>

              <button
                type="button"
                className="team-modal-close"
                onClick={() =>
                  setShowForm(false)
                }
              >
                ×
              </button>
            </div>

            {formError && (
              <div className="team-form-error">
                {formError}
              </div>
            )}

            <form
              className="team-form"
              onSubmit={handleAddMember}
            >
              <Input
                label="Full Name"
                name="name"
                placeholder="Enter full name"
                value={form.name}
                onChange={handleChange}
                required
              />

              <Input
                label="Email"
                type="email"
                name="email"
                placeholder="member@example.com"
                value={form.email}
                onChange={handleChange}
                required
              />

              <Input
                label="Temporary Password"
                type="password"
                name="password"
                placeholder="Minimum 6 characters"
                value={form.password}
                onChange={handleChange}
                required
              />

              <div className="team-form-field">
                <label>Role</label>

                <select
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                >
                  <option value="member">
                    Member
                  </option>

                  <option value="manager">
                    Manager
                  </option>

                  <option value="admin">
                    Admin
                  </option>
                </select>
              </div>

              <div className="team-form-actions">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() =>
                    setShowForm(false)
                  }
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  loading={saving}
                >
                  Add Member
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================================
          CHANGE ROLE MODAL
      ================================= */}

      {showRoleModal && actionMember && (
        <div
          className="team-modal-overlay"
          onClick={closeActionModals}
        >
          <div
            className="team-modal team-small-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="team-modal-header">
              <div>
                <h2>Change Role</h2>

                <p>
                  Update access for{" "}
                  <strong>
                    {actionMember.user?.name}
                  </strong>
                </p>
              </div>

              <button
                type="button"
                className="team-modal-close"
                onClick={closeActionModals}
              >
                ×
              </button>
            </div>

            {actionError && (
              <div className="team-form-error">
                {actionError}
              </div>
            )}

            <div className="team-form">
              <div className="team-form-field">
                <label>Workspace Role</label>

                <select
                  value={selectedRole}
                  onChange={(event) =>
                    setSelectedRole(
                      event.target.value
                    )
                  }
                >
                  <option value="member">
                    Member
                  </option>

                  <option value="manager">
                    Manager
                  </option>

                  <option value="admin">
                    Admin
                  </option>

                  {actionMember.role === "owner" && (
                    <option value="owner">
                      Owner
                    </option>
                  )}
                </select>
              </div>

              <div className="team-form-actions">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={closeActionModals}
                  disabled={actionLoading}
                >
                  Cancel
                </Button>

                <Button
                  type="button"
                  loading={actionLoading}
                  onClick={handleRoleUpdate}
                >
                  Save Role
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================================
          REMOVE MEMBER MODAL
      ================================= */}

      {showRemoveModal && actionMember && (
        <div
          className="team-modal-overlay"
          onClick={closeActionModals}
        >
          <div
            className="team-modal team-small-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="team-remove-icon">
              !
            </div>

            <div className="team-remove-content">
              <h2>Remove team member?</h2>

              <p>
                Are you sure you want to remove{" "}
                <strong>
                  {actionMember.user?.name}
                </strong>{" "}
                from this workspace?
              </p>

              <span>
                This member will no longer have
                access to the workspace.
              </span>
            </div>

            {actionError && (
              <div className="team-form-error">
                {actionError}
              </div>
            )}

            <div className="team-form-actions">
              <Button
                type="button"
                variant="secondary"
                onClick={closeActionModals}
                disabled={actionLoading}
              >
                Cancel
              </Button>

              <Button
                type="button"
                variant="danger"
                loading={actionLoading}
                onClick={handleRemoveMember}
              >
                Remove Member
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Team;