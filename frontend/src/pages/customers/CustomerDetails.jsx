import {  useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Building2,
  CalendarDays,
  Edit3,
  Mail,
  MapPin,
  Phone,
  Trash2,
  UserRound,
} from "lucide-react";

import api from "../../services/api";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Spinner from "../../components/ui/Spinner";

import "./CustomerDetails.css";

function CustomerDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

useEffect(() => {
  let cancelled = false;

  const loadCustomer = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        `/customers/${id}`
      );

      if (!cancelled) {
        setCustomer(response.data.customer);
      }
    } catch (err) {
      if (!cancelled) {
        console.error(
          "Fetch customer error:",
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
      }
    }
  };

  loadCustomer();

  return () => {
    cancelled = true;
  };
}, [id]);
  const handleDelete = async () => {
    try {
      setDeleteLoading(true);

      await api.delete(`/customers/${id}`);

      navigate("/customers");
    } catch (err) {
      console.error("Delete customer error:", err);

      setError(
        err.response?.data?.message ||
          "Failed to delete customer"
      );

      setDeleteLoading(false);
      setShowDeleteModal(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  const getStatusVariant = (status) => {
    if (status === "active") return "success";
    if (status === "inactive") return "danger";
    return "warning";
  };

  if (loading) {
    return (
      <div className="customer-details-loading">
        <Spinner />
        <p>Loading customer...</p>
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="customer-details-error">
        <h2>Customer not found</h2>

        <p>
          {error || "This customer could not be found."}
        </p>

        <Button
          variant="secondary"
          onClick={() => navigate("/customers")}
        >
          <ArrowLeft size={16} />
          Back to Customers
        </Button>
      </div>
    );
  }

  return (
    <div className="customer-details-page">
      {/* HEADER */}

      <div className="customer-details-header">
        <button
          className="customer-back-button"
          onClick={() => navigate("/customers")}
        >
          <ArrowLeft size={18} />
          Back to Customers
        </button>

        <div className="customer-header-actions">
          <Button
            variant="secondary"
            onClick={() =>
              navigate(`/customers/${id}/edit`)
            }
          >
            <Edit3 size={16} />
            Edit
          </Button>

          <Button
            variant="danger"
            onClick={() =>
              setShowDeleteModal(true)
            }
          >
            <Trash2 size={16} />
            Delete
          </Button>
        </div>
      </div>

      {/* PROFILE CARD */}

      <div className="customer-profile-card">
        <div className="customer-avatar">
          {customer.name
            ?.charAt(0)
            .toUpperCase()}
        </div>

        <div className="customer-profile-main">
          <div className="customer-name-row">
            <h1>{customer.name}</h1>

            <Badge
              variant={getStatusVariant(
                customer.status
              )}
            >
              {customer.status}
            </Badge>
          </div>

          <p className="customer-company">
            {customer.company ||
              "No company specified"}
          </p>

          {customer.industry && (
            <span className="customer-industry">
              {customer.industry}
            </span>
          )}
        </div>
      </div>

      {/* CONTENT GRID */}

      <div className="customer-details-grid">
        {/* CONTACT INFORMATION */}

        <section className="customer-info-card">
          <div className="customer-card-header">
            <h2>Contact Information</h2>
          </div>

          <div className="customer-info-list">
            <div className="customer-info-item">
              <div className="customer-info-icon">
                <Mail size={18} />
              </div>

              <div>
                <span>Email</span>
                <p>
                  {customer.email || "Not provided"}
                </p>
              </div>
            </div>

            <div className="customer-info-item">
              <div className="customer-info-icon">
                <Phone size={18} />
              </div>

              <div>
                <span>Phone</span>
                <p>
                  {customer.phone || "Not provided"}
                </p>
              </div>
            </div>

            <div className="customer-info-item">
              <div className="customer-info-icon">
                <MapPin size={18} />
              </div>

              <div>
                <span>Address</span>
                <p>
                  {customer.address ||
                    "Not provided"}
                </p>
              </div>
            </div>

            <div className="customer-info-item">
              <div className="customer-info-icon">
                <Building2 size={18} />
              </div>

              <div>
                <span>Industry</span>
                <p>
                  {customer.industry ||
                    "Not specified"}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ASSIGNMENT */}

        <section className="customer-info-card">
          <div className="customer-card-header">
            <h2>Assignment</h2>
          </div>

          <div className="customer-assignment">
            <div className="assignment-avatar">
              {customer.assignedTo?.name
                ?.charAt(0)
                .toUpperCase() || (
                <UserRound size={18} />
              )}
            </div>

            <div>
              <span>Assigned To</span>

              <p>
                {customer.assignedTo?.name ||
                  "Unassigned"}
              </p>

              {customer.assignedTo?.email && (
                <small>
                  {customer.assignedTo.email}
                </small>
              )}
            </div>
          </div>
        </section>

        {/* CUSTOMER INFORMATION */}

        <section className="customer-info-card">
          <div className="customer-card-header">
            <h2>Customer Information</h2>
          </div>

          <div className="customer-meta-grid">
            <div>
              <span>Status</span>

              <Badge
                variant={getStatusVariant(
                  customer.status
                )}
              >
                {customer.status}
              </Badge>
            </div>

            <div>
              <span>Created</span>

              <p>
                <CalendarDays size={15} />
                {formatDate(customer.createdAt)}
              </p>
            </div>

            <div>
              <span>Last Updated</span>

              <p>
                <CalendarDays size={15} />
                {formatDate(customer.updatedAt)}
              </p>
            </div>

            <div>
              <span>Created By</span>

              <p>
                {customer.createdBy?.name ||
                  "Unknown"}
              </p>
            </div>
          </div>
        </section>

        {/* NOTES */}

        <section className="customer-info-card customer-notes-card">
          <div className="customer-card-header">
            <h2>Notes</h2>
          </div>

          <div className="customer-notes">
            {customer.notes ? (
              <p>{customer.notes}</p>
            ) : (
              <p className="empty-notes">
                No notes added for this customer.
              </p>
            )}
          </div>
        </section>
      </div>

      {/* DELETE MODAL */}

      {showDeleteModal && (
        <div
          className="customer-modal-overlay"
          onClick={() =>
            !deleteLoading &&
            setShowDeleteModal(false)
          }
        >
          <div
            className="customer-delete-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="delete-icon">
              <Trash2 size={22} />
            </div>

            <h2>Delete Customer?</h2>

            <p>
              Are you sure you want to delete{" "}
              <strong>{customer.name}</strong>?
              This action cannot be undone.
            </p>

            <div className="delete-modal-actions">
              <Button
                variant="secondary"
                disabled={deleteLoading}
                onClick={() =>
                  setShowDeleteModal(false)
                }
              >
                Cancel
              </Button>

              <Button
                variant="danger"
                loading={deleteLoading}
                onClick={handleDelete}
              >
                Delete Customer
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CustomerDetails;