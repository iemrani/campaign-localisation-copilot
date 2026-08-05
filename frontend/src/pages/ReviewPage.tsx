import { useEffect, useState } from "react";
import { type Campaign, type Variant, getCampaigns, reviewVariant } from "../api";
import axios from "axios";

export default function ReviewPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaign, setSelected] = useState<number>(0);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [form, setForm] = useState({ reviewer_name: "", reviewer_role: "LEGAL_REVIEW", decision: "APPROVED", comments: "", edited_text: "" });
  const [activeVariant, setActive] = useState<Variant | null>(null);
  const [msg, setMsg] = useState("");

  useEffect(() => { getCampaigns().then(r => setCampaigns(r.data)); }, []);

  const loadVariants = async (cid: number) => {
    const r = await axios.get(`http://127.0.0.1:8000/campaigns/${cid}/variants`).catch(() => ({ data: [] }));
    setVariants(r.data);
  };

  const handleSelect = (cid: number) => { setSelected(cid); loadVariants(cid); };

  const handleReview = async () => {
    if (!activeVariant) return;
    try {
      await reviewVariant(activeVariant.id, {
        reviewer_role: form.reviewer_role,
        reviewer_name: form.reviewer_name,
        decision: form.decision,
        comments: form.comments || undefined,
        edited_text: form.edited_text || undefined,
      });
      setMsg(`✅ Review recorded — ${form.decision}`);
      loadVariants(selectedCampaign);
      setActive(null);
    } catch { setMsg("❌ Review failed."); }
  };

  const statusColor: Record<string, string> = { DRAFT: "#aaa", UNDER_REVIEW: "#e8a020", APPROVED: "green", REJECTED: "red" };

  return (
    <div style={{ maxWidth: 800 }}>
      <h1 style={{ marginBottom: "1.5rem" }}>✅ Review & Approvals</h1>

      <div style={{ marginBottom: "1.5rem" }}>
        <label style={labelStyle}>Select Campaign</label>
        <select style={inputStyle} value={selectedCampaign}
          onChange={e => handleSelect(Number(e.target.value))}>
          <option value={0}>— select —</option>
          {campaigns.map(c => <option key={c.id} value={c.id}>#{c.id} {c.name}</option>)}
        </select>
      </div>

      {variants.length === 0 && selectedCampaign > 0 && <p style={{ color: "#888" }}>No variants found for this campaign.</p>}

      {variants.map(v => (
        <div key={v.id} style={{ ...card, marginBottom: "0.75rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <strong>Variant #{v.id}</strong>
              <span style={{ marginLeft: "0.75rem", fontWeight: 700, color: statusColor[v.status] }}>{v.status}</span>
              <div style={{ fontSize: "0.8rem", color: "#888", marginTop: "0.25rem" }}>Version {v.version}</div>
            </div>
            {v.status === "UNDER_REVIEW" && (
              <button style={btn} onClick={() => { setActive(v); setForm(f => ({ ...f, edited_text: v.generated_text || "" })); }}>
                Review
              </button>
            )}
          </div>
          <pre style={{ background: "#f4f4f4", padding: "0.75rem", borderRadius: 6, whiteSpace: "pre-wrap", marginTop: "0.75rem", fontSize: "0.85rem" }}>
            {v.generated_text}
          </pre>
        </div>
      ))}

      {activeVariant && (
        <div style={{ ...card, marginTop: "1.5rem", border: "2px solid #e8c468" }}>
          <h2 style={{ marginBottom: "1rem" }}>📝 Reviewing Variant #{activeVariant.id}</h2>
          {[
            { label: "Your Name", key: "reviewer_name", type: "input" },
            { label: "Your Role", key: "reviewer_role", type: "select", options: ["GLOBAL_MARKETING", "LOCAL_MARKET", "LEGAL_REVIEW"] },
            { label: "Decision", key: "decision", type: "select", options: ["APPROVED", "REJECTED"] },
            { label: "Comments", key: "comments", type: "textarea" },
            { label: "Edited Text (optional)", key: "edited_text", type: "textarea" },
          ].map(({ label, key, type, options }) => (
            <div key={key} style={{ marginBottom: "1rem" }}>
              <label style={labelStyle}>{label}</label>
              {type === "select" ? (
                <select style={inputStyle} value={(form as any)[key]}
                  onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}>
                  {(options as string[]).map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              ) : type === "textarea" ? (
                <textarea rows={4} style={inputStyle} value={(form as any)[key]}
                  onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} />
              ) : (
                <input style={inputStyle} value={(form as any)[key]}
                  onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} />
              )}
            </div>
          ))}
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button style={btn} onClick={handleReview}>Submit Review</button>
            <button style={{ ...btn, background: "#888" }} onClick={() => setActive(null)}>Cancel</button>
          </div>
          {msg && <p style={{ marginTop: "0.75rem", color: msg.startsWith("✅") ? "green" : "red" }}>{msg}</p>}
        </div>
      )}
      {msg && !activeVariant && <p style={{ color: msg.startsWith("✅") ? "green" : "red" }}>{msg}</p>}
    </div>
  );
}

const card: React.CSSProperties = { background: "#fff", borderRadius: 10, padding: "1.5rem", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" };
const inputStyle: React.CSSProperties = { width: "100%", padding: "0.5rem 0.75rem", borderRadius: 6, border: "1px solid #ddd", fontSize: "0.95rem", boxSizing: "border-box" };
const labelStyle: React.CSSProperties = { display: "block", marginBottom: "0.25rem", fontWeight: 500, fontSize: "0.9rem" };
const btn: React.CSSProperties = { background: "#1a1a2e", color: "#e8c468", border: "none", padding: "0.6rem 1.2rem", borderRadius: 6, cursor: "pointer", fontWeight: 600 };