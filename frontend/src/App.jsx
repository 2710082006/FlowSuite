import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

import Dashboard from "./pages/dashboard/Dashboard";
import Projects from "./pages/projects/Projects";
import ProjectDetails from "./pages/projects/ProjectDetails";
import Tasks from "./pages/tasks/Tasks";
import Team from "./pages/team/Team";

import Customers from "./pages/customers/Customers";
import CustomerEdit from "./pages/customers/CustomerEdit";
import CustomerDetails from "./pages/customers/CustomerDetails";

import Billing from "./pages/billing/Billing";
import AuditLogs from "./pages/AuditLogs/AuditLogs";
import ProtectedRoute from "./components/common/ProtectedRoute";
import DashboardLayout from "./components/layout/DashboardLayout";
import ProfileSettings from "./pages/settings/ProfileSettings";
import WorkspaceSettings from "./pages/settings/WorkspaceSettings";
import Settings from "./pages/settings/Settings";
import SecuritySettings from "./pages/settings/SecuritySettings";
import PreferencesSettings from "./pages/settings/PreferencesSettings";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route
          path="/"
          element={<Navigate to="/login" replace />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route element={<ProtectedRoute />}>

          <Route
            path="/dashboard"
            element={
              <DashboardLayout>
                <Dashboard />
              </DashboardLayout>
            }
          />

          <Route
            path="/projects"
            element={
              <DashboardLayout>
                <Projects />
              </DashboardLayout>
            }
          />

          <Route
            path="/projects/:id"
            element={
              <DashboardLayout>
                <ProjectDetails />
              </DashboardLayout>
            }
          />

          <Route
            path="/tasks"
            element={
              <DashboardLayout>
                <Tasks />
              </DashboardLayout>
            }
          />
<Route
  path="/forgot-password"
  element={<ForgotPassword />}
/>
<Route
  path="/reset-password/:token"
  element={<ResetPassword />}
/>
          <Route
            path="/team"
            element={
              <DashboardLayout>
                <Team />
              </DashboardLayout>
            }
          />

          <Route
            path="/customers"
            element={
              <DashboardLayout>
                <Customers />
              </DashboardLayout>
            }
          />

          <Route
            path="/customers/:id"
            element={
              <DashboardLayout>
                <CustomerDetails />
              </DashboardLayout>
            }
          />

          <Route
            path="/customers/:id/edit"
            element={
              <DashboardLayout>
                <CustomerEdit />
              </DashboardLayout>
            }
          />

          <Route
            path="/billing"
            element={
              <DashboardLayout>
                <Billing />
              </DashboardLayout>
            }
          />

          <Route
            path="/audit-logs"
            element={
              <DashboardLayout>
                <AuditLogs />
              </DashboardLayout>
            }
          />
<Route
  path="/settings"
  element={
    <DashboardLayout>
      <Settings />
    </DashboardLayout>
  }
>
  <Route
    index
    element={<Navigate to="profile" replace />}
  />

  <Route
    path="profile"
    element={<ProfileSettings />}
  />

  <Route
    path="workspace"
    element={<WorkspaceSettings />}
  />

  <Route
    path="security"
    element={<SecuritySettings />}
  />
  <Route
  path="preferences"
  element={<PreferencesSettings />}
/>
</Route>

  </Route>

        <Route
          path="*"
          element={<Navigate to="/login" replace />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;