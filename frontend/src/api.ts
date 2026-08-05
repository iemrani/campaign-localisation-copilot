import axios from "axios";

const API = axios.create({ baseURL: "http://127.0.0.1:8000" });

// ── Types ────────────────────────────────────────────────────────────────────

export interface Campaign {
  id: number;
  name: string;
  brand: string;
  extracted_spec: Record<string, unknown> | null;
  created_at: string;
}

export interface Market  { id: number; code: string; name: string; language: string; }
export interface Channel { id: number; name: string; }

export interface Variant {
  id: number;
  campaign_id: number;
  market_id: number;
  channel_id: number;
  generated_text: string | null;
  status: "DRAFT" | "UNDER_REVIEW" | "APPROVED" | "REJECTED";
  risk_flags: Record<string, boolean>;
  version: number;
  created_at: string;
}

export interface Review {
  id: number;
  variant_id: number;
  reviewer_role: string;
  reviewer_name: string;
  decision: string;
  comments: string | null;
  created_at: string;
}

export interface Telemetry {
  campaign_id: number;
  total_variants: number;
  approved: number;
  rejected: number;
  under_review: number;
  avg_time_to_draft_sec: number | null;
  avg_time_to_approval_sec: number | null;
  avg_revisions: number | null;
}

export interface RunLog {
  id: number;
  campaign_id: number;
  step: string;
  status: string;
  started_at: string;
  finished_at: string | null;
  duration_sec: number | null;
  llm_model: string | null;
  error_message: string | null;
}

// ── API calls ────────────────────────────────────────────────────────────────

export const getCampaigns   = () => API.get<Campaign[]>("/campaigns");
export const createCampaign = (data: { name: string; brand: string; brief_text: string; guidelines_text: string }) =>
  API.post<Campaign>("/campaigns", data);
export const ingestCampaign = (id: number) => API.post<Campaign>(`/campaigns/${id}/ingest`);

export const getMarkets  = () => API.get<Market[]>("/markets");
export const getChannels = () => API.get<Channel[]>("/channels");

export const localise = (campaign_id: number, market_id: number, channel_id: number) =>
  API.post<Variant>("/localise", { campaign_id, market_id, channel_id });

export const checkVariant  = (id: number) => API.post(`/variants/${id}/check`);
export const submitVariant = (id: number) => API.post<Variant>(`/variants/${id}/submit`);
export const reviewVariant = (id: number, data: {
  reviewer_role: string;
  reviewer_name: string;
  decision: string;
  comments?: string;
  edited_text?: string;
}) => API.post<Review>(`/variants/${id}/review`, data);

export const getVariants   = (campaign_id: number) =>
  API.get<Variant[]>(`/campaigns/${campaign_id}/variants`).catch(() => ({ data: [] as Variant[] }));
export const getTelemetry  = (campaign_id: number) => API.get<Telemetry>(`/campaigns/${campaign_id}/telemetry`);
export const getRunLogs    = (campaign_id: number) => API.get<RunLog[]>(`/run-logs/${campaign_id}`);