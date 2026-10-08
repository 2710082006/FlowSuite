import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  Users,
  UserRound,
  CreditCard,
  Settings,
  LogOut,
  X,
  ShieldCheck ,
} from "lucide-react";

import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/useAuth";

import "./Sidebar.css";
function Sidebar({ mobileOpen, onClose }) {
  const { user, logout } = useAuth();

  const navigation = [
    {
      label: "Overview",
      path: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "Projects",
      path: "/projects",
      icon: FolderKanban,
    },
    {
      label: "Tasks",
      path: "/tasks",
      icon: CheckSquare,
    },
    {
      label: "Customers",
      path: "/customers",
      icon: UserRound,
    },
    {
      label: "Team",
      path: "/team",
      icon: Users,
    },
    {
      label: "Billing",
      path: "/billing",
      icon: CreditCard,
    },
    {
  label: "Audit Logs",
  path: "/audit-logs",
  icon: ShieldCheck,
},
  ];

  return (
    <>
      {mobileOpen && (
        <div
          className="sidebar-overlay"
          onClick={onClose}
        />
      )}

      <aside
        className={`sidebar ${
          mobileOpen ? "sidebar-open" : ""
        }`}
      >
        <div className="sidebar-top">

          <div className="sidebar-brand">
            <div className="sidebar-logo">
              F
            </div>

            <span>FlowSuite</span>

            <button
              className="sidebar-close"
              onClick={onClose}
              aria-label="Close menu"
            >
              <X size={20} />
            </button>
          </div>

          <div className="workspace-selector">
            <div className="workspace-avatar">
              FS
            </div>

            <div className="workspace-info">
              <strong>My Workspace</strong>
              <span>Free Plan</span>
            </div>

            <span className="workspace-arrow">
             ⌄
            </span>
          </div>

          <nav className="sidebar-nav">

            <p className="sidebar-section-title">
              WORKSPACE
            </p>

            {navigation.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === "/dashboard"}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `sidebar-link ${
                      isActive
                        ? "sidebar-link-active"
                        : ""
                    }`
                  }
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}

            <p className="sidebar-section-title sidebar-settings-title">
              SYSTEM
            </p>

            <NavLink
              to="/settings"
              onClick={onClose}
              className={({ isActive }) =>
                `sidebar-link ${
                  isActive
                    ? "sidebar-link-active"
                    : ""
                }`
              }
            >
              <Settings size={18} />
              <span>Settings</span>
            </NavLink>

          </nav>
        </div>

        <div className="sidebar-bottom">

          <div className="sidebar-user">
            <div className="user-avatar">
              {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </div>

            <div className="sidebar-user-info">
              <strong>{user?.name || "User"}</strong>
              <span>{user?.email || ""}</span>
            </div>
          </div>

          <button
            className="sidebar-logout"
            onClick={logout}
          >
            <LogOut size={17} />
            <span>Log out</span>
          </button>

        </div>
      </aside>
    </>
  );
}

export default Sidebar;