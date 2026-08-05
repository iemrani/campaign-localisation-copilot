import { useEffect, useState } from "react";
import { type Campaign, createCampaign, getCampaigns, ingestCampaign } from "../api";

export default function CampaignUploadPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [form, setForm] = useState({ name: "", brand: "Lavazza", brief_text: "", guidelines_text: "" });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const load = () => getCampaigns().then(r => setCampaigns(r.data));
  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    setLoading(true); setMsg("");
    try {
      await createCampaign(form);
      setMsg("✅ Campaign created.");
      setForm({ name: "", brand: "Lavazza", brief_text: "", guidelines_text: "" });
      load();
    } catch { setMsg("❌ Error creating campaign."); }
    finally { setLoading(false); }
  };

  const handleIngest = async (id: number) => {
    setLoading(true); setMsg("");
    try {
      await ingestCampaign(id);
      setMsg(`✅ Ingestion complete for campaign #${id}`);
      load();
    } catch { setMsg("❌ Ingestion failed."); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ maxWidth: 720 }}>
      <h1 style={{ marginBottom: "1.5rem" }}>📋 Campaigns</h1>

      <div style={card}>
        <h2 style={{ marginBottom: "1rem" }}>New Campaign</h2>
        {[
          { label: "Campaign Name", key: "name", multiline: false },
          { label: "Brand", key: "brand", multiline: false },
          { label: "Brief Text", key: "brief_text", multiline: true },
          { label: "Guidelines Text", key: "guidelines_text", multiline: true },
        ].map(({ label, key, multiline }) => (
          <div key={key} style={{ marginBottom: "1rem" }}>
            <label style={labelStyle}>{label}</label>
            {multiline ? (
              <textarea rows={4} style={inputStyle} value={(form as any)[key]}
                onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} />
            ) : (
              <input style={inputStyle} value={(form as any)[key]}
                onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} />
            )}
          </div>
        ))}
        <button style={btn} disabled={loading || !form.name} onClick={handleCreate}>
          {loading ? "Creating…" : "Create Campaign"}
        </button>
        {msg && <p style={{ marginTop: "0.75rem", color: msg.startsWith("✅") ? "green" : "red" }}>{msg}</p>}
      </div>

      <h2 style={{ margin: "2rem 0 1rem" }}>Existing Campaigns</h2>
      {campaigns.length === 0 && <p style={{ color: "#888" }}>No campaigns yet.</p>}
      {campaigns.map(c => (
        <div key={c.id} style={{ ...card, marginBottom: "0.75rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <strong>{c.name}</strong>
            <span style={{ marginLeft: "0.75rem", color: "#888", fontSize: "0.85rem" }}>#{c.id} · {c.brand}</span>
            <div style={{ fontSize: "0.8rem", color: c.extracted_spec ? "green" : "#aaa", marginTop: "0.25rem" }}>
              {c.extracted_spec ? "✅ Spec extracted" : "⏳ Not ingested yet"}
            </div>
          </div>
          <button style={{ ...btn, fontSize: "0.85rem" }} disabled={loading} onClick={() => handleIngest(c.id)}>
            Run Ingestion
          </button>
        </div>
      ))}
    </div>
  );
}

const card: React.CSSProperties = {
  background: "#fff", borderRadius: 10, padding: "1.5rem",
  boxShadow: "0 2px 8px rgba(0,0,0,0.06)"
};
const inputStyle: React.CSSProperties = {
  width: "100%", padding: "0.5rem 0.75rem", borderRadius: 6,
  border: "1px solid #ddd", fontSize: "0.95rem", boxSizing: "border-box"
};
const labelStyle: React.CSSProperties = { display: "block", marginBottom: "0.25rem", fontWeight: 500, fontSize: "0.9rem" };
const btn: React.CSSProperties = {
  background: "#1a1a2e", color: "#e8c468", border: "none",
  padding: "0.6rem 1.2rem", borderRadius: 6, cursor: "pointer", fontWeight: 600
};