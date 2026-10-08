import { NavLink, Outlet } from "react-router-dom";
import {
  User,
  Building2,
  LockKeyhole,
  SlidersHorizontal,
} from "lucide-react";

import "./Settings.css";

function Settings() {
  const settingsNavigation = [
    {
      label: "Profile",
      description: "Manage your personal information",
      path: "/settings/profile",
      icon: User,
    },
    {
      label: "Workspace",
      description: "Manage workspace information",
      path: "/settings/workspace",
      icon: Building2,
    },
    {
      label: "Password & Security",
      description: "Manage your password and security",
      path: "/settings/security",
      icon: LockKeyhole,
    },
    {
      label: "Preferences",
      description: "Manage application preferences",
      path: "/settings/preferences",
      icon: SlidersHorizontal,
    },
  ];

  return (
    <div className="settings-page">
      <div className="settings-header">
        <p className="settings-eyebrow">SETTINGS</p>

        <h1>Settings</h1>

        <p>
          Manage your account, workspace, security,
          and application preferences.
        </p>
      </div>

      <div className="settings-layout">
        <aside className="settings-sidebar">
          <nav>
            {settingsNavigation.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `settings-nav-item ${
                      isActive
                        ? "settings-nav-item-active"
                        : ""
                    }`
                  }
                >
                  <div className="settings-nav-icon">
                    <Icon size={18} />
                  </div>

                  <div className="settings-nav-content">
                    <strong>{item.label}</strong>
                    <span>{item.description}</span>
                  </div>
                </NavLink>
              );
            })}
          </nav>
        </aside>

        <section className="settings-content">
          <Outlet />
        </section>
      </div>
    </div>
  );
}

export default Settings;