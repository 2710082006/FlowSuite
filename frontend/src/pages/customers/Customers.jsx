import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import api from "../../services/api";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";

import "./Customers.css";

function Customers() {
  const [customers, setCustomers] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [membersLoading, setMembersLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [industryFilter, setIndustryFilter] = useState("");
  const [assignedFilter, setAssignedFilter] =
    useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] =
    useState(null);

  const [showDeleteModal, setShowDeleteModal] =
    useState(false);
  const [customerToDelete, setCustomerToDelete] =
    useState(null);

  const [formData, setFormData] = useState({
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

  // ==============================
  // FETCH CUSTOMERS
  // ==============================

  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const params = {};

      if (search.trim()) {
        params.search = search.trim();
      }

      if (statusFilter) {
        params.status = statusFilter;
      }

      if (industryFilter) {
        params.industry = industryFilter;
      }

      if (assignedFilter) {
        params.assignedTo = assignedFilter;
      }

      const response = await api.get("/customers", {
        params,
      });

      setCustomers(response.data.customers || []);
    } catch (err) {
      console.error(
        "Fetch customers error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to load customers"
      );
    } finally {
      setLoading(false);
    }
  }, [
    search,
    statusFilter,
    industryFilter,
    assignedFilter,
  ]);

  // ==============================
  // FETCH TEAM MEMBERS
  // ==============================
useEffect(() => {
  let cancelled = false;

  const loadTeamMembers = async () => {
    try {
      setMembersLoading(true);

      const response = await api.get("/team");

      if (!cancelled) {
        setTeamMembers(
          response.data.members || []
        );
      }
    } catch (err) {
      if (!cancelled) {
        console.error(
          "Fetch team members error:",
          err
        );
      }
    } finally {
      if (!cancelled) {
        setMembersLoading(false);
      }
    }
  };

  loadTeamMembers();

  return () => {
    cancelled = true;
  };
}, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCustomers();
    }, 300);

    return () => clearTimeout(timer);
  }, [fetchCustomers]);


  // ==============================
  // FORM HELPERS
  // ==============================

  const resetForm = () => {
    setFormData({
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

    setFormError("");
  };

  const openCreateModal = () => {
    setEditingCustomer(null);
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (customer) => {
    setEditingCustomer(customer);

    setFormData({
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

    setFormError("");
    setShowModal(true);
  };

  const closeModal = () => {
    if (actionLoading) return;

    setShowModal(false);
    setEditingCustomer(null);
    resetForm();
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ==============================
  // CREATE / UPDATE CUSTOMER
  // ==============================

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.name.trim()) {
      setFormError(
        "Customer name is required"
      );
      return;
    }

    try {
      setActionLoading(true);
      setFormError("");

      const payload = {
        ...formData,
        assignedTo:
          formData.assignedTo || null,
      };

      if (editingCustomer) {
        const response = await api.put(
          `/customers/${editingCustomer._id}`,
          payload
        );

        setCustomers((prev) =>
          prev.map((customer) =>
            customer._id ===
            editingCustomer._id
              ? response.data.customer
              : customer
          )
        );
      } else {
        const response = await api.post(
          "/customers",
          payload
        );

        setCustomers((prev) => [
          response.data.customer,
          ...prev,
        ]);
      }

      closeModal();
    } catch (err) {
      console.error(
        "Save customer error:",
        err
      );

      setFormError(
        err.response?.data?.message ||
          "Failed to save customer"
      );
    } finally {
      setActionLoading(false);
    }
  };

  // ==============================
  // DELETE CUSTOMER
  // ==============================

  const openDeleteModal = (customer) => {
    setCustomerToDelete(customer);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    if (actionLoading) return;

    setShowDeleteModal(false);
    setCustomerToDelete(null);
  };

  const handleDelete = async () => {
    if (!customerToDelete) return;

    try {
      setActionLoading(true);

      await api.delete(
        `/customers/${customerToDelete._id}`
      );

      setCustomers((prev) =>
        prev.filter(
          (customer) =>
            customer._id !==
            customerToDelete._id
        )
      );

      closeDeleteModal();
    } catch (err) {
      console.error(
        "Delete customer error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to delete customer"
      );
    } finally {
      setActionLoading(false);
    }
  };

  // ==============================
  // INDUSTRIES
  // ==============================

  const industries = useMemo(() => {
    const values = customers
      .map(
        (customer) => customer.industry
      )
      .filter(Boolean);

    return [...new Set(values)].sort();
  }, [customers]);

  // ==============================
  // STATISTICS
  // ==============================

  const stats = useMemo(() => {
    return {
      total: customers.length,

      active: customers.filter(
        (customer) =>
          customer.status === "active"
      ).length,

      leads: customers.filter(
        (customer) =>
          customer.status === "lead"
      ).length,

      inactive: customers.filter(
        (customer) =>
          customer.status === "inactive"
      ).length,
    };
  }, [customers]);

  // ==============================
  // STATUS HELPERS
  // ==============================

  const getStatusVariant = (status) => {
    switch (status) {
      case "active":
        return "success";

      case "inactive":
        return "danger";

      case "lead":
        return "warning";

      default:
        return "default";
    }
  };

  const formatStatus = (status) => {
    if (!status) return "Unknown";

    return status
      .replace("_", " ")
      .replace(/\b\w/g, (letter) =>
        letter.toUpperCase()
      );
  };

  // ==============================
  // RENDER
  // ==============================

  return (
    <div className="customers-page">
      {/* HEADER */}

      <div className="customers-header">
        <div>
          <span className="customers-eyebrow">
            CUSTOMER MANAGEMENT
          </span>

          <h1>Customers</h1>

          <p>
            Manage your workspace customers,
            relationships and account
            information.
          </p>
        </div>

        <Button onClick={openCreateModal}>
          + Add Customer
        </Button>
      </div>

      {/* STATS */}

      <div className="customer-stats">
        <div className="customer-stat-card">
          <span>Total Customers</span>
          <strong>{stats.total}</strong>
        </div>

        <div className="customer-stat-card">
          <span>Active</span>
          <strong>{stats.active}</strong>
        </div>

        <div className="customer-stat-card">
          <span>Leads</span>
          <strong>{stats.leads}</strong>
        </div>

        <div className="customer-stat-card">
          <span>Inactive</span>
          <strong>{stats.inactive}</strong>
        </div>
      </div>

      {/* MAIN CARD */}

      <div className="customers-card">
        <div className="customers-toolbar">
          {/* SEARCH */}

          <div className="customer-search">
            <span>⌕</span>

            <input
              type="text"
              placeholder="Search customers..."
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
            />
          </div>

          {/* FILTERS */}

          <div className="customer-filters">
            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value
                )
              }
            >
              <option value="">
                All Statuses
              </option>

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

            <select
              value={industryFilter}
              onChange={(event) =>
                setIndustryFilter(
                  event.target.value
                )
              }
            >
              <option value="">
                All Industries
              </option>

              {industries.map(
                (industry) => (
                  <option
                    key={industry}
                    value={industry}
                  >
                    {industry}
                  </option>
                )
              )}
            </select>

            <select
              value={assignedFilter}
              onChange={(event) =>
                setAssignedFilter(
                  event.target.value
                )
              }
            >
              <option value="">
                All Assignees
              </option>

              {teamMembers.map(
                (member) => (
                  <option
                    key={member.user?._id}
                    value={member.user?._id}
                  >
                    {member.user?.name}
                  </option>
                )
              )}
            </select>
          </div>
        </div>

        {/* ERROR */}

        {error && (
          <div className="customers-error">
            {error}

            <button
              type="button"
              onClick={() => setError("")}
            >
              ×
            </button>
          </div>
        )}

        {/* LOADING */}

        {loading ? (
          <div className="customers-state">
            <div className="customers-loader" />

            <p>
              Loading customers...
            </p>
          </div>
        ) : customers.length === 0 ? (
          /* EMPTY */

          <div className="customers-empty">
            <div className="customers-empty-icon">
              👥
            </div>

            <h3>
              No customers found
            </h3>

            <p>
              Add your first customer to
              start managing customer
              relationships.
            </p>

            <Button
              onClick={openCreateModal}
            >
              Add Customer
            </Button>
          </div>
        ) : (
          /* TABLE */

          <div className="customers-table-wrapper">
            <table className="customers-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Company</th>
                  <th>Industry</th>
                  <th>Status</th>
                  <th>Assigned To</th>
                  <th>Contact</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {customers.map(
                  (customer) => (
                    <tr
                      key={
                        customer._id
                      }
                    >
                      {/* CUSTOMER */}

                      <td>
                        <div className="customer-main">
                          <div className="customer-avatar">
                            {customer.name
                              ?.charAt(
                                0
                              )
                              .toUpperCase()}
                          </div>

                          <div>
                            <strong>
                              {
                                customer.name
                              }
                            </strong>

                            <span>
                              {customer.email ||
                                "No email"}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* COMPANY */}

                      <td>
                        {customer.company ||
                          "—"}
                      </td>

                      {/* INDUSTRY */}

                      <td>
                        {customer.industry ||
                          "—"}
                      </td>

                      {/* STATUS */}

                      <td>
                        <Badge
                          variant={getStatusVariant(
                            customer.status
                          )}
                        >
                          {formatStatus(
                            customer.status
                          )}
                        </Badge>
                      </td>

                      {/* ASSIGNEE */}

                      <td>
                        {customer.assignedTo
                          ?.name ||
                          "Unassigned"}
                      </td>

                      {/* CONTACT */}

                      <td>
                        <div className="customer-contact">
                          {customer.phone && (
                            <span>
                              {
                                customer.phone
                              }
                            </span>
                          )}

                          {customer.email && (
                            <span>
                              {
                                customer.email
                              }
                            </span>
                          )}
                        </div>
                      </td>

                      {/* ACTIONS */}

                      <td>
                        <div className="customer-actions">
                          <button
                            type="button"
                            className="customer-action-edit"
                            onClick={() =>
                              openEditModal(
                                customer
                              )
                            }
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            className="customer-action-delete"
                            onClick={() =>
                              openDeleteModal(
                                customer
                              )
                            }
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE / EDIT MODAL */}

      {showModal && (
        <div
          className="customer-modal-overlay"
          onClick={closeModal}
        >
          <div
            className="customer-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="customer-modal-header">
              <div>
                <span className="customers-eyebrow">
                  CUSTOMER
                </span>

                <h2>
                  {editingCustomer
                    ? "Edit Customer"
                    : "Add Customer"}
                </h2>

                <p>
                  {editingCustomer
                    ? "Update customer information."
                    : "Create a new customer for your workspace."}
                </p>
              </div>

              <button
                type="button"
                className="customer-modal-close"
                onClick={closeModal}
              >
                ×
              </button>
            </div>

            {formError && (
              <div className="customer-form-error">
                {formError}
              </div>
            )}

            <form
              className="customer-form"
              onSubmit={handleSubmit}
            >
              <div className="customer-form-grid">
                {/* NAME */}

                <div className="customer-field">
                  <label>
                    Customer Name *
                  </label>

                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter customer name"
                  />
                </div>

                {/* COMPANY */}

                <div className="customer-field">
                  <label>
                    Company
                  </label>

                  <input
                    name="company"
                    value={
                      formData.company
                    }
                    onChange={handleChange}
                    placeholder="Company name"
                  />
                </div>

                {/* EMAIL */}

                <div className="customer-field">
                  <label>Email</label>

                  <input
                    type="email"
                    name="email"
                    value={
                      formData.email
                    }
                    onChange={handleChange}
                    placeholder="customer@example.com"
                  />
                </div>

                {/* PHONE */}

                <div className="customer-field">
                  <label>Phone</label>

                  <input
                    name="phone"
                    value={
                      formData.phone
                    }
                    onChange={handleChange}
                    placeholder="Phone number"
                  />
                </div>

                {/* INDUSTRY */}

                <div className="customer-field">
                  <label>
                    Industry
                  </label>

                  <input
                    name="industry"
                    value={
                      formData.industry
                    }
                    onChange={handleChange}
                    placeholder="e.g. Software"
                  />
                </div>

                {/* STATUS */}

                <div className="customer-field">
                  <label>Status</label>

                  <select
                    name="status"
                    value={
                      formData.status
                    }
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

                {/* ASSIGNED TO */}

                <div className="customer-field">
                  <label>
                    Assigned To
                  </label>

                  <select
                    name="assignedTo"
                    value={
                      formData.assignedTo
                    }
                    onChange={handleChange}
                    disabled={
                      membersLoading
                    }
                  >
                    <option value="">
                      {membersLoading
                        ? "Loading members..."
                        : "Unassigned"}
                    </option>

                    {teamMembers.map(
                      (member) => (
                        <option
                          key={
                            member.user?._id
                          }
                          value={
                            member.user?._id
                          }
                        >
                          {
                            member.user
                              ?.name
                          }
                        </option>
                      )
                    )}
                  </select>
                </div>

                {/* ADDRESS */}

                <div className="customer-field customer-field-full">
                  <label>
                    Address
                  </label>

                  <input
                    name="address"
                    value={
                      formData.address
                    }
                    onChange={handleChange}
                    placeholder="Customer address"
                  />
                </div>

                {/* NOTES */}

                <div className="customer-field customer-field-full">
                  <label>
                    Notes
                  </label>

                  <textarea
                    name="notes"
                    value={
                      formData.notes
                    }
                    onChange={handleChange}
                    placeholder="Additional notes..."
                    rows="4"
                  />
                </div>
              </div>

              <div className="customer-form-actions">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={closeModal}
                  disabled={
                    actionLoading
                  }
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  loading={
                    actionLoading
                  }
                >
                  {editingCustomer
                    ? "Save Changes"
                    : "Create Customer"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}

      {showDeleteModal &&
        customerToDelete && (
          <div
            className="customer-modal-overlay"
            onClick={closeDeleteModal}
          >
            <div
              className="customer-delete-modal"
              onClick={(event) =>
                event.stopPropagation()
              }
            >
              <div className="customer-delete-icon">
                !
              </div>

              <h2>
                Delete customer?
              </h2>

              <p>
                Are you sure you want to
                delete{" "}
                <strong>
                  {
                    customerToDelete.name
                  }
                </strong>
                ?
              </p>

              <span>
                This action cannot be
                undone.
              </span>

              <div className="customer-form-actions">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={
                    closeDeleteModal
                  }
                  disabled={
                    actionLoading
                  }
                >
                  Cancel
                </Button>

                <Button
                  type="button"
                  variant="danger"
                  loading={
                    actionLoading
                  }
                  onClick={
                    handleDelete
                  }
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

export default Customers;