import { useEffect, useState } from "react";
import { type Campaign, type RunLog, type Telemetry, getCampaigns, getRunLogs, getTelemetry } from "../api";

export default function TelemetryPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selected, setSelected]   = useState<number>(0);
  const [telemetry, setTelemetry] = useState<Telemetry | null>(null);
  const [logs, setLogs]           = useState<RunLog[]>([]);

  useEffect(() => { getCampaigns().then(r => setCampaigns(r.data)); }, []);

  const handleSelect = async (cid: number) => {
    setSelected(cid);
    if (!cid) return;
    const [t, l] = await Promise.all([getTelemetry(cid), getRunLogs(cid)]);
    setTelemetry(t.data);
    setLogs(l.data);
  };

  const statusColor: Record<string, string> = { RUNNING: "#e8a020", SUCCESS: "green", FAILED: "red" };
  const stepColor:   Record<string, string> = { INGEST: "#4a90d9", LOCALISE: "#7b4fdb", CHECK: "#e8a020", REVIEW: "#2d9c5e", TELEMETRY: "#888" };

  const fmt = (sec: number | null) => sec == null ? "—" : sec < 1 ? `${Math.round(sec * 1000)}ms` : `${sec.toFixed(1)}s`;

  return (
    <div style={{ maxWidth: 860 }}>
      <h1 style={{ marginBottom: "1.5rem" }}>📊 Telemetry & Insights</h1>

      <div style={{ marginBottom: "1.5rem" }}>
        <label style={labelStyle}>Select Campaign</label>
        <select style={inputStyle} value={selected}
          onChange={e => handleSelect(Number(e.target.value))}>
          <option value={0}>— select —</option>
          {campaigns.map(c => <option key={c.id} value={c.id}>#{c.id} {c.name}</option>)}
        </select>
      </div>

      {telemetry && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
          {[
            { label: "Total Variants",      value: telemetry.total_variants },
            { label: "Approved",            value: telemetry.approved,          color: "green" },
            { label: "Rejected",            value: telemetry.rejected,          color: "red"   },
            { label: "Under Review",        value: telemetry.under_review,      color: "#e8a020" },
            { label: "Avg Draft Time",      value: fmt(telemetry.avg_time_to_draft_sec) },
            { label: "Avg Approval Time",   value: fmt(telemetry.avg_time_to_approval_sec) },
            { label: "Avg Revisions",       value: telemetry.avg_revisions?.toFixed(1) ?? "—" },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ background: "#fff", borderRadius: 10, padding: "1.25rem", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", textAlign: "center" }}>
              <div style={{ fontSize: "1.75rem", fontWeight: 700, color: color ?? "#1a1a2e" }}>{value}</div>
              <div style={{ fontSize: "0.8rem", color: "#888", marginTop: "0.25rem" }}>{label}</div>
            </div>
          ))}
        </div>
      )}

      {logs.length > 0 && (
        <div style={{ background: "#fff", borderRadius: 10, padding: "1.5rem", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
          <h2 style={{ marginBottom: "1rem" }}>Agent Run Logs</h2>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #eee", textAlign: "left" }}>
                {["#", "Step", "Status", "Model", "Duration", "Started at", "Error"].map(h => (
                  <th key={h} style={{ padding: "0.5rem 0.75rem", color: "#555" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {logs.map(log => (
                <tr key={log.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                  <td style={{ padding: "0.5rem 0.75rem" }}>{log.id}</td>
                  <td style={{ padding: "0.5rem 0.75rem" }}>
                    <span style={{ background: stepColor[log.step] ?? "#888", color: "#fff", padding: "0.2rem 0.6rem", borderRadius: 4, fontSize: "0.78rem", fontWeight: 600 }}>
                      {log.step}
                    </span>
                  </td>
                  <td style={{ padding: "0.5rem 0.75rem", color: statusColor[log.status] ?? "#aaa", fontWeight: 600 }}>{log.status}</td>
                  <td style={{ padding: "0.5rem 0.75rem", color: "#888" }}>{log.llm_model ?? "—"}</td>
                  <td style={{ padding: "0.5rem 0.75rem" }}>{fmt(log.duration_sec)}</td>
                  <td style={{ padding: "0.5rem 0.75rem", color: "#888" }}>{new Date(log.started_at).toLocaleTimeString()}</td>
                  <td style={{ padding: "0.5rem 0.75rem", color: "red", fontSize: "0.78rem" }}>{log.error_message ?? ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const inputStyle: React.CSSProperties = { width: "100%", padding: "0.5rem 0.75rem", borderRadius: 6, border: "1px solid #ddd", fontSize: "0.95rem", boxSizing: "border-box", maxWidth: 360 };
const labelStyle: React.CSSProperties = { display: "block", marginBottom: "0.25rem", fontWeight: 500, fontSize: "0.9rem" };