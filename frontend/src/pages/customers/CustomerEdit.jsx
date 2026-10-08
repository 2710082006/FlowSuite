import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  UserRound,
} from "lucide-react";

import api from "../../services/api";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Spinner from "../../components/ui/Spinner";

import "./CustomerEdit.css";

function CustomerEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    address: "",
    industry: "",
    status: "lead",
    assignedTo: "",
    notes: "",
  });

  const [teamMembers, setTeamMembers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [membersLoading, setMembersLoading] =
    useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadData = async () => {
      try {
        setLoading(true);
        setMembersLoading(true);
        setError("");

        const [customerResponse, teamResponse] =
          await Promise.all([
            api.get(`/customers/${id}`),
            api.get("/team"),
          ]);

        if (cancelled) return;

        const customer =
          customerResponse.data.customer;

        setForm({
          name: customer.name || "",
          company: customer.company || "",
          email: customer.email || "",
          phone: customer.phone || "",
          address: customer.address || "",
          industry: customer.industry || "",
          status: customer.status || "lead",
          assignedTo:
            customer.assignedTo?._id || "",
          notes: customer.notes || "",
        });

        setTeamMembers(
          teamResponse.data.members || []
        );
      } catch (err) {
        if (!cancelled) {
          console.error(
            "Load customer edit data error:",
            err
          );

          setError(
            err.response?.data?.message ||
              "Failed to load customer"
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
          setMembersLoading(false);
        }
      }
    };

    loadData();

    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (formError) {
      setFormError("");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.name.trim()) {
      setFormError("Customer name is required.");
      return;
    }

    try {
      setSaving(true);
      setFormError("");

      await api.put(`/customers/${id}`, {
        name: form.name.trim(),
        company: form.company.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
        industry: form.industry.trim(),
        status: form.status,
        assignedTo: form.assignedTo || null,
        notes: form.notes.trim(),
      });

      navigate(`/customers/${id}`);
    } catch (err) {
      console.error(
        "Update customer error:",
        err
      );

      setFormError(
        err.response?.data?.message ||
          "Failed to update customer."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="customer-edit-loading">
        <Spinner />
        <p>Loading customer...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="customer-edit-error">
        <h2>Unable to load customer</h2>

        <p>{error}</p>

        <Button
          variant="secondary"
          onClick={() =>
            navigate("/customers")
          }
        >
          <ArrowLeft size={16} />
          Back to Customers
        </Button>
      </div>
    );
  }

  return (
    <div className="customer-edit-page">
      {/* HEADER */}

      <div className="customer-edit-header">
        <button
          className="customer-edit-back"
          onClick={() =>
            navigate(`/customers/${id}`)
          }
        >
          <ArrowLeft size={18} />
          Back to Customer
        </button>

        <div>
          <h1>Edit Customer</h1>
          <p>
            Update customer information and
            assignment.
          </p>
        </div>
      </div>

      {/* FORM CARD */}

      <form
        className="customer-edit-form"
        onSubmit={handleSubmit}
      >
        <div className="customer-edit-section">
          <div className="customer-edit-section-title">
            <h2>Basic Information</h2>
            <p>
              Core information about this customer.
            </p>
          </div>

          <div className="customer-edit-fields">
            <Input
              label="Customer Name"
              name="name"
              placeholder="Enter customer name"
              value={form.name}
              onChange={handleChange}
              required
            />

            <Input
              label="Company"
              name="company"
              placeholder="Enter company name"
              value={form.company}
              onChange={handleChange}
            />

            <Input
              label="Email"
              type="email"
              name="email"
              placeholder="customer@example.com"
              value={form.email}
              onChange={handleChange}
            />

            <Input
              label="Phone"
              type="tel"
              name="phone"
              placeholder="+91 9876543210"
              value={form.phone}
              onChange={handleChange}
            />

            <Input
              label="Industry"
              name="industry"
              placeholder="e.g. IT, Finance, Healthcare"
              value={form.industry}
              onChange={handleChange}
            />

            <div className="customer-edit-field">
              <label htmlFor="status">
                Status
              </label>

              <select
                id="status"
                name="status"
                value={form.status}
                onChange={handleChange}
              >
                <option value="lead">
                  Lead
                </option>

                <option value="active">
                  Active
                </option>

                <option value="inactive">
                  Inactive
                </option>
              </select>
            </div>
          </div>
        </div>

        {/* ADDRESS */}

        <div className="customer-edit-section">
          <div className="customer-edit-section-title">
            <h2>Location</h2>
            <p>
              Add the customer's address.
            </p>
          </div>

          <div className="customer-edit-field">
            <label htmlFor="address">
              Address
            </label>

            <textarea
              id="address"
              name="address"
              rows="3"
              placeholder="Enter customer address"
              value={form.address}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* ASSIGNMENT */}

        <div className="customer-edit-section">
          <div className="customer-edit-section-title">
            <h2>Assignment</h2>
            <p>
              Assign this customer to a workspace
              team member.
            </p>
          </div>

          <div className="customer-edit-field">
            <label htmlFor="assignedTo">
              Assigned To
            </label>

            <div className="customer-assignee-select">
              <UserRound size={17} />

              <select
                id="assignedTo"
                name="assignedTo"
                value={form.assignedTo}
                onChange={handleChange}
                disabled={membersLoading}
              >
                <option value="">
                  {membersLoading
                    ? "Loading team members..."
                    : "Unassigned"}
                </option>

                {teamMembers.map((member) => (
                  <option
                    key={member.user?._id}
                    value={member.user?._id}
                  >
                    {member.user?.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* NOTES */}

        <div className="customer-edit-section">
          <div className="customer-edit-section-title">
            <h2>Notes</h2>
            <p>
              Keep useful information about this
              customer.
            </p>
          </div>

          <div className="customer-edit-field">
            <label htmlFor="notes">
              Customer Notes
            </label>

            <textarea
              id="notes"
              name="notes"
              rows="6"
              placeholder="Add notes about this customer..."
              value={form.notes}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* ERROR */}

        {formError && (
          <div className="customer-edit-form-error">
            {formError}
          </div>
        )}

        {/* ACTIONS */}

        <div className="customer-edit-actions">
          <Button
            variant="secondary"
            type="button"
            disabled={saving}
            onClick={() =>
              navigate(`/customers/${id}`)
            }
          >
            Cancel
          </Button>

          <Button
            type="submit"
            loading={saving}
          >
            <Save size={16} />
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}

export default CustomerEdit;