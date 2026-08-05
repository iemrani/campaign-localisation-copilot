import { BrowserRouter, NavLink, Route, Routes } from "react-router-dom";
import CampaignUploadPage    from "./pages/CampaignUploadPage";
import LocalizationWorkspace from "./pages/LocalizationWorkspace";
import ReviewPage            from "./pages/ReviewPage";
import TelemetryPage         from "./pages/TelemetryPage";
import "./index.css";

export default function App() {
  return (
    <BrowserRouter>
      <div style={{ display: "flex", minHeight: "100vh", fontFamily: "system-ui, sans-serif" }}>

        {/* Sidebar */}
        <nav style={{
          width: 220, background: "#1a1a2e", color: "#fff",
          padding: "2rem 1rem", display: "flex", flexDirection: "column", gap: "0.5rem"
        }}>
          <div style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "1.5rem", color: "#e8c468" }}>
            ☕ Campaign Copilot
          </div>
          {[
            { to: "/",            label: "📋 Campaigns"     },
            { to: "/localise",    label: "🌍 Localise"      },
            { to: "/review",      label: "✅ Review"        },
            { to: "/telemetry",   label: "📊 Telemetry"     },
          ].map(({ to, label }) => (
            <NavLink key={to} to={to} end style={({ isActive }) => ({
              color: isActive ? "#e8c468" : "#ccc",
              textDecoration: "none",
              padding: "0.5rem 0.75rem",
              borderRadius: 6,
              background: isActive ? "#2a2a4e" : "transparent",
              fontWeight: isActive ? 600 : 400,
            })}>
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Main content */}
        <main style={{ flex: 1, padding: "2rem", background: "#f7f6f2", overflowY: "auto" }}>
          <Routes>
            <Route path="/"          element={<CampaignUploadPage />} />
            <Route path="/localise"  element={<LocalizationWorkspace />} />
            <Route path="/review"    element={<ReviewPage />} />
            <Route path="/telemetry" element={<TelemetryPage />} />
          </Routes>
        </main>

      </div>
    </BrowserRouter>
  );
}