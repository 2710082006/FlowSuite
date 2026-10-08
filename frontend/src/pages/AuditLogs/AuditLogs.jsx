import { useEffect, useState } from "react";
import { Search, Filter, ShieldCheck } from "lucide-react";
import api from "../../services/api";
import Badge from "../../components/ui/Badge";
import "./AuditLogs.css";

function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("all");

  useEffect(() => {
    const fetchAuditLogs = async () => {
      try {
        const response = await api.get("/audit");
        setLogs(response.data.logs || []);
      } catch (error) {
        console.error("Failed to fetch audit logs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAuditLogs();
  }, []);

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.description
        ?.toLowerCase()
        .includes(search.toLowerCase()) ||
      log.entityType
        ?.toLowerCase()
        .includes(search.toLowerCase()) ||
      log.actor?.name
        ?.toLowerCase()
        .includes(search.toLowerCase());

    const matchesAction =
      actionFilter === "all" ||
      log.action === actionFilter;

    return matchesSearch && matchesAction;
  });

  const getBadgeVariant = (action) => {
    if (action === "created") return "success";
    if (action === "updated") return "info";
    if (action === "deleted") return "danger";
    return "default";
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="audit-page">
      <div className="audit-header">
        <div>
          <div className="audit-title-row">
            <ShieldCheck size={26} />
            <h1>Audit Logs</h1>
          </div>

          <p>
            Track important activities and changes
            across your workspace.
          </p>
        </div>
      </div>

      <div className="audit-toolbar">
        <div className="audit-search">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search activity..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="audit-filter">
          <Filter size={17} />

          <select
            value={actionFilter}
            onChange={(e) =>
              setActionFilter(e.target.value)
            }
          >
            <option value="all">All actions</option>
            <option value="created">Created</option>
            <option value="updated">Updated</option>
            <option value="deleted">Deleted</option>
          </select>
        </div>
      </div>

      <div className="audit-card">
        {loading ? (
          <div className="audit-empty">
            Loading audit logs...
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="audit-empty">
            No audit logs found.
          </div>
        ) : (
          <div className="audit-table-wrapper">
            <table className="audit-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Action</th>
                  <th>Entity</th>
                  <th>Description</th>
                  <th>Date</th>
                </tr>
              </thead>

              <tbody>
                {filteredLogs.map((log) => (
                  <tr key={log._id}>
                    <td>
                      <div className="audit-user">
                        <div className="audit-avatar">
                          {log.actor?.name
                            ?.charAt(0)
                            .toUpperCase() || "U"}
                        </div>

                        <div>
                          <strong>
                            {log.actor?.name ||
                              "System"}
                          </strong>

                          <span>
                            {log.actor?.email || ""}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <Badge
                        variant={getBadgeVariant(
                          log.action
                        )}
                      >
                        {log.action}
                      </Badge>
                    </td>

                    <td>
                      <span className="audit-entity">
                        {log.entityType}
                      </span>
                    </td>

                    <td className="audit-description">
                      {log.description}
                    </td>

                    <td className="audit-date">
                      {formatDate(log.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="audit-footer">
        Showing {filteredLogs.length} of {logs.length} activities
      </div>
    </div>
  );
}

export default AuditLogs;