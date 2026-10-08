import { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";

import "./DashboardLayout.css";

function DashboardLayout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="dashboard-layout">
      <Sidebar
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />

      <div className="dashboard-main">
        <Header
          onMenuClick={() => setMobileOpen(true)}
        />

        <main className="dashboard-content">
          {children}
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;