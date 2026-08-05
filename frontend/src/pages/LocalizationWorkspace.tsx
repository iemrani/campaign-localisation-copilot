import { useEffect, useState } from "react";
import { type Campaign, type Channel, type Market, type Variant, checkVariant, getCampaigns, getChannels, getMarkets, localise, submitVariant } from "../api";

export default function LocalizationWorkspace() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [markets,   setMarkets]   = useState<Market[]>([]);
  const [channels,  setChannels]  = useState<Channel[]>([]);
  const [sel, setSel] = useState({ campaign_id: 0, market_id: 0, channel_id: 0 });
  const [variant, setVariant]     = useState<Variant | null>(null);
  const [checkResult, setCheck]   = useState<any>(null);
  const [loading, setLoading]     = useState(false);
  const [msg, setMsg]             = useState("");

  useEffect(() => {
    getCampaigns().then(r => setCampaigns(r.data));
    getMarkets().then(r  => setMarkets(r.data));
    getChannels().then(r => setChannels(r.data));
  }, []);

  const handleLocalise = async () => {
    setLoading(true); setMsg(""); setVariant(null); setCheck(null);
    try {
      const r = await localise(sel.campaign_id, sel.market_id, sel.channel_id);
      setVariant(r.data);
      setMsg("✅ Variant generated.");
    } catch { setMsg("❌ Localisation failed. Make sure ingestion ran first."); }
    finally { setLoading(false); }
  };

  const handleCheck = async () => {
    if (!variant) return;
    setLoading(true);
    try {
      const r = await checkVariant(variant.id);
      setCheck(r.data);
      setMsg("✅ Compliance check complete.");
    } catch { setMsg("❌ Check failed."); }
    finally { setLoading(false); }
  };

  const handleSubmit = async () => {
    if (!variant) return;
    setLoading(true);
    try {
      const r = await submitVariant(variant.id);
      setVariant(r.data);
      setMsg("✅ Submitted for review.");
    } catch { setMsg("❌ Submit failed."); }
    finally { setLoading(false); }
  };

  const statusColor: Record<string, string> = {
    DRAFT: "#aaa", UNDER_REVIEW: "#e8a020", APPROVED: "green", REJECTED: "red"
  };

  return (
    <div style={{ maxWidth: 760 }}>
      <h1 style={{ marginBottom: "1.5rem" }}>🌍 Localisation Workspace</h1>

      <div style={card}>
        <h2 style={{ marginBottom: "1rem" }}>Generate a Variant</h2>
        {[
          { label: "Campaign", key: "campaign_id", options: campaigns.map(c => ({ id: c.id, label: `#${c.id} ${c.name}` })) },
          { label: "Market",   key: "market_id",   options: markets.map(m  => ({ id: m.id, label: `${m.name} (${m.language})` })) },
          { label: "Channel",  key: "channel_id",  options: channels.map(c => ({ id: c.id, label: c.name })) },
        ].map(({ label, key, options }) => (
          <div key={key} style={{ marginBottom: "1rem" }}>
            <label style={labelStyle}>{label}</label>
            <select style={inputStyle} value={(sel as any)[key]}
              onChange={e => setSel(s => ({ ...s, [key]: Number(e.target.value) }))}>
              <option value={0}>— select —</option>
              {options.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
            </select>
          </div>
        ))}
        <button style={btn} disabled={loading || !sel.campaign_id || !sel.market_id || !sel.channel_id}
          onClick={handleLocalise}>
          {loading ? "Generating…" : "Generate Localised Copy"}
        </button>
        {msg && <p style={{ marginTop: "0.75rem", color: msg.startsWith("✅") ? "green" : "red" }}>{msg}</p>}
      </div>

      {variant && (
        <div style={{ ...card, marginTop: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2>Generated Variant #{variant.id}</h2>
            <span style={{ fontWeight: 700, color: statusColor[variant.status] }}>{variant.status}</span>
          </div>
          <pre style={{ background: "#f4f4f4", padding: "1rem", borderRadius: 6, whiteSpace: "pre-wrap", marginTop: "1rem" }}>
            {variant.generated_text}
          </pre>
          <div style={{ marginTop: "1rem", display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <button style={btn} disabled={loading} onClick={handleCheck}>Run Compliance Check</button>
            <button style={{ ...btn, background: "#2d6a4f" }} disabled={loading || variant.status !== "DRAFT"} onClick={handleSubmit}>
              Submit for Review
            </button>
          </div>
        </div>
      )}

      {checkResult && (
        <div style={{ ...card, marginTop: "1.5rem" }}>
          <h2>🛡️ Compliance Result</h2>
          <div style={{ marginTop: "0.75rem" }}>
            {Object.entries(checkResult.risk_flags as Record<string, boolean>).map(([k, v]) => (
              <div key={k} style={{ padding: "0.25rem 0", color: v ? "red" : "green" }}>
                {v ? "⚠️" : "✅"} {k.replace(/_/g, " ")}
              </div>
            ))}
          </div>
          {checkResult.suggestions?.length > 0 && (
            <div style={{ marginTop: "1rem" }}>
              <strong>Suggestions:</strong>
              <ul style={{ marginTop: "0.5rem", paddingLeft: "1.25rem" }}>
                {checkResult.suggestions.map((s: string, i: number) => <li key={i}>{s}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const card: React.CSSProperties = { background: "#fff", borderRadius: 10, padding: "1.5rem", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" };
const inputStyle: React.CSSProperties = { width: "100%", padding: "0.5rem 0.75rem", borderRadius: 6, border: "1px solid #ddd", fontSize: "0.95rem", boxSizing: "border-box" };
const labelStyle: React.CSSProperties = { display: "block", marginBottom: "0.25rem", fontWeight: 500, fontSize: "0.9rem" };
const btn: React.CSSProperties = { background: "#1a1a2e", color: "#e8c468", border: "none", padding: "0.6rem 1.2rem", borderRadius: 6, cursor: "pointer", fontWeight: 600 };