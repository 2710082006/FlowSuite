import { useEffect, useState } from "react";
import {
  Building2,
  ShieldCheck,
  CreditCard,
  UserRound,
  RefreshCw,
} from "lucide-react";

import api from "../../services/api";
import { useAuth } from "../../context/useAuth";
//import DashboardLayout from "../../layouts/DashboardLayout";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Spinner from "../../components/ui/Spinner";
import Button from "../../components/ui/Button";

import "./Dashboard.css";

function Dashboard() {
  const { user } = useAuth();

  const [workspace, setWorkspace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchWorkspace = async (showLoading = true) => {
  if (showLoading) {
    setLoading(true);
  }

  setError("");

  try {
    const response = await api.get("/workspace");

    setWorkspace(response.data.workspace);
  } catch (err) {
    console.error("Workspace fetch error:", err);

    setError(
      err.response?.data?.message ||
        "Unable to load workspace information."
    );
  } finally {
    if (showLoading) {
      setLoading(false);
    }
  }
};

useEffect(() => {
  let cancelled = false;

  const loadWorkspace = async () => {
    try {
      const response = await api.get("/workspace");

      if (!cancelled) {
        setWorkspace(response.data.workspace);
        setError("");
        setLoading(false);
      }
    } catch (err) {
      console.error("Workspace fetch error:", err);

      if (!cancelled) {
        setError(
          err.response?.data?.message ||
            "Unable to load workspace information."
        );
        setLoading(false);
      }
    }
  };

  loadWorkspace();

  return () => {
    cancelled = true;
  };
}, []);

  return (
  
      <div className="dashboard-page">
        <section className="dashboard-welcome">
          <div>
            <p className="dashboard-eyebrow">WORKSPACE OVERVIEW</p>

            <h1>
              Welcome back, {user?.name || "there"}
            </h1>

            <span>
              Here's an overview of your FlowSuite workspace.
            </span>
          </div>

          <Button
            variant="secondary"
              onClick={() => fetchWorkspace(true)}
            disabled={loading}
          >
            <RefreshCw size={15} />
            Refresh
          </Button>
        </section>

        {loading ? (
          <div className="dashboard-loading">
            <Spinner />
            <p>Loading workspace...</p>
          </div>
        ) : error ? (
          <Card className="dashboard-message-card">
            <div className="dashboard-error">
              <p>{error}</p>

              <Button onClick={fetchWorkspace}>
                Try again
              </Button>
            </div>
          </Card>
        ) : workspace ? (
          <>
            <section className="workspace-summary">
              <Card className="workspace-main-card">
                <div className="workspace-card-heading">
                  <div className="workspace-icon">
                    <Building2 size={22} />
                  </div>

                  <Badge variant="success">
                    {workspace.status}
                  </Badge>
                </div>

                <p className="workspace-label">
                  YOUR WORKSPACE
                </p>

                <h2>{workspace.name}</h2>

                <p className="workspace-description">
                  Your team's central place for projects,
                  tasks and collaboration.
                </p>

                <div className="workspace-meta">
                  <span>Workspace ID</span>
                  <code>{workspace._id}</code>
                </div>
              </Card>

              <Card className="workspace-detail-card">
                <div className="workspace-detail-icon">
                  <CreditCard size={19} />
                </div>

                <p className="workspace-label">
                  SUBSCRIPTION PLAN
                </p>

                <h3>
                  {workspace.plan
                    ? workspace.plan.charAt(0).toUpperCase() +
                      workspace.plan.slice(1)
                    : "Free"}
                </h3>

                <Badge variant="info">Current plan</Badge>
              </Card>

              <Card className="workspace-detail-card">
                <div className="workspace-detail-icon">
                  <UserRound size={19} />
                </div>

                <p className="workspace-label">
                  WORKSPACE OWNER
                </p>

                <h3>
                  {workspace.owner?.name || user?.name || "Owner"}
                </h3>

                <p className="workspace-owner-email">
                  {workspace.owner?.email || user?.email}
                </p>
              </Card>
            </section>

            <Card className="workspace-security-card">
              <div className="security-icon">
                <ShieldCheck size={21} />
              </div>

              <div>
                <h3>Workspace is connected</h3>

                <p>
                  Your workspace information is being
                  retrieved from the FlowSuite API.
                </p>
              </div>

              <Badge variant="success">Connected</Badge>
            </Card>

            <section className="dashboard-next-section">
              <div>
                <h2>Build your workspace</h2>
                <p>
                  Projects, tasks, team members and customers
                  will appear here as you add them.
                </p>
              </div>
            </section>
          </>
        ) : null}
      </div>
    
  );
}

export default Dashboard;