# Global Campaign Localisation Copilot

An agentic AI workflow that helps a multinational coffee brand localise global marketing campaigns for multiple markets with human approvals, compliance checks, and telemetry.  

Designed as a portfolio project to demonstrate the skills required for an **Agentic AI Productivity Specialist** working in a Microsoft‑centric environment (Microsoft 365, Power Platform, Azure OpenAI). [web:16][web:28]

---

## 1. Why this project

Global brands run campaigns across dozens of countries, languages, and channels. Moving from a **master campaign brief** to **localised assets** (emails, social posts, POS materials) usually requires slow email threads, copy/paste, and repeated re‑work between:

- Central marketing (brand guardians, global strategy)  
- Local market managers  
- Legal / compliance / sustainability teams  

This copilot shows how **agentic AI** can streamline that process while respecting brand voice, legal constraints, and governance:

- Automates the heavy lifting of localisation and first drafts  
- Keeps **humans in the loop** for approvals and edits  
- Enforces **compliance and Responsible AI** principles (audit trail, PII awareness, versioning)  
- Produces **telemetry** so the business can measure impact (time saved, approval speed, common issues) [web:16][web:28][web:49]

The design and vocabulary are aligned with Microsoft’s guidance on **agentic AI business solutions** (focus on architecture, trade‑offs, governance, and lifecycle over just prompts). [web:37][web:39]

---

## 2. High-level solution

### 2.1 Core idea

> Given a master campaign brief and brand guidelines, the copilot helps local teams generate, review, and approve localised campaign content, with structured logs and metrics.

The solution is implemented as a **multi-step agentic workflow**:

1. **Ingestion Agent**  
   - Reads the global campaign brief + brand guidelines  
   - Extracts structured information: key messages, mandatory claims, target audiences, tone of voice, legal/sustainability constraints  

2. **Localisation Agent**  
   - Takes the structured spec + target market + channel (e.g., email, Instagram, POS)  
   - Generates localised copy variants in the target language  
   - Provides reasoning and risk flags (cultural issues, strong claims, missing disclaimers)  

3. **Compliance & Brand Check Agent**  
   - Scans generated content for:  
     - Missing or incorrect disclaimers  
     - Potentially non‑compliant sustainability / health claims  
     - Tone of voice deviations vs. guidelines  
   - Annotates content with warnings and suggested edits  

4. **Human Review Workflow**  
   - Central / local / legal reviewers see content + warnings in a UI  
   - They can edit, accept, or reject variants  
   - All decisions are stored with **who/when/what changed** for auditability  

5. **Telemetry & Insights Agent**  
   - Aggregates run data to answer:  
     - Time from brief to first draft per market  
     - Time from first draft to approval  
     - Average number of revisions  
     - Most common compliance issues  
   - Exposes data for dashboards and continuous improvement  

This workflow reflects how agentic AI solutions are described in the Lavazza JD and in Microsoft’s agentic AI architecture training: multi‑agent orchestration, human‑in‑the‑loop, and measurable business value. [web:16][web:28][web:37][web:39]

---

## 3. Architecture overview

> ⚠️ This repo is implemented as a **local developer PoC** (laptop‑friendly). The README also explains how it maps 1:1 to the **Microsoft stack** (Microsoft 365, Power Platform, Azure OpenAI) for a production deployment. [web:16][web:28][web:39]

### 3.1 Components

- **Frontend**  
  - React SPA (Vite)  
  - Pages:  
    - Campaign Upload (brief + guidelines)  
    - Localisation Workspace (per market/channel)  
    - Review & Approvals  
    - Telemetry & Insights  

- **Backend**  
  - FastAPI service exposing REST endpoints  
  - Explicit `workflows.py` module describing the agent steps (ingest → localise → check → review → telemetry)  

- **LLM / Agent Layer**  
  - Pluggable client (e.g., Claude or Azure OpenAI) wrapped in `llm_client.py`  
  - Prompts are written as **functions/tools** with clear responsibilities, mirroring Microsoft’s agent framework style (agents + tools). [web:47][web:50]  

- **Data & Logging**  
  - SQLite (dev) with a simple schema for:  
    - Campaigns  
    - Markets & Channels  
    - Generated Variants  
    - Reviews & Approvals  
    - Run Logs (step‑level logs with timestamps, status, model version)  

- **Security & Governance Concepts**  
  - Role types: `GLOBAL_MARKETING`, `LOCAL_MARKET`, `LEGAL_REVIEW` (simulated)  
  - PII awareness: simple detection & highlighting of emails, phone numbers, and personal names in content, to show awareness of PII handling and GDPR principles  
  - Versioning: every agent output and every human edit is persisted as a new version with diff metadata  

---

## 4. Mapping to Microsoft ecosystem (how it would run at Lavazza)

Although the repo runs locally, it is intentionally designed to slot into a **Microsoft‑centric enterprise environment**: [web:16][web:28][web:39]

- **Files & Storage**  
  - Campaign briefs & brand guidelines → SharePoint / OneDrive  
  - Localised assets → SharePoint libraries or dedicated Teams file tabs  

- **User Experience**  
  - Frontend → React app hosted as:  
    - A standalone internal web app, or  
    - Embedded as a **Teams tab app** for marketing & local teams  

- **Workflow & Orchestration**  
  - The Python `workflows.py` state machine maps to:  
    - **Power Automate flows** (triggers: “new campaign brief uploaded”, “variant approved”)  
    - Approvals via **Teams adaptive cards**  

- **LLM & Agentic Layer**  
  - The local `llm_client.py` abstraction is designed to be swapped to **Azure OpenAI** + Microsoft Agent Framework providers in production, following patterns from Azure OpenAI Agents documentation. [web:36][web:47][web:50]  

- **Telemetry & Monitoring**  
  - SQLite + logs in the PoC → **Application Insights / Log Analytics** in production  
  - Telemetry exported for **Power BI** dashboards to show: time saved, adoption, reliability, and common compliance pain points  

This mapping is documented so that the project not only demonstrates coding skills, but also **architecture thinking** aligned with Microsoft’s agentic AI business solutions certification path. [web:37][web:39]

---

## 5. Data model (simplified)

Key entities (implemented via SQLAlchemy / Pydantic in `models.py` / `schemas.py`):

- `Campaign`  
  - `id`, `name`, `brand`, `start_date`, `end_date`  
  - `brief_file_path`, `guidelines_file_path`  

- `Market`  
  - `id`, `code`, `language`, `timezone`  

- `Channel`  
  - `id`, `name` (email, Instagram, POS, etc.)  

- `CampaignVariant`  
  - `id`, `campaign_id`, `market_id`, `channel_id`  
  - `generated_text`, `status` (DRAFT, UNDER_REVIEW, APPROVED, REJECTED)  
  - `risk_flags` (JSON)  

- `Review`  
  - `id`, `variant_id`, `reviewer_role`, `decision`, `comments`, `created_at`  

- `RunLog`  
  - `id`, `campaign_id`, `step` (INGEST, LOCALISE, CHECK, REVIEW)  
  - `status`, `started_at`, `finished_at`  
  - `llm_model`, `llm_temperature`, `metadata` (JSON)  

---

## 6. Agentic workflow in practice

Implemented (or planned) in `workflows.py` as explicit steps:

1. `run_ingestion(campaign_id)`  
   - Reads files, calls `llm_client.extract_campaign_spec(...)`, stores structured spec.  

2. `run_localisation(campaign_id, market_id, channel_id)`  
   - Uses stored spec + parameters to call `llm_client.generate_local_copy(...)`.  
   - Creates initial `CampaignVariant` with status `DRAFT`.  

3. `run_compliance_check(variant_id)`  
   - Calls `llm_client.check_compliance(...)`.  
   - Populates `risk_flags` (e.g. `{"missing_disclaimer": true, "tone_issue": false}`).  

4. `submit_for_review(variant_id, reviewer_role)`  
   - Sets status to `UNDER_REVIEW`.  
   - Notifies (simulated) reviewers. In a Microsoft deployment, this maps to a Teams notification / Power Automate approval.  

5. `record_review(variant_id, decision, comments)`  
   - Stores a `Review` row.  
   - Updates variant status (`APPROVED` / `REJECTED`).  
   - Writes to `RunLog`.  

6. `compute_telemetry(campaign_id)`  
   - Aggregates metrics used by the Telemetry page.  

This explicit workflow lets you talk convincingly about **orchestration and agent patterns** (state machines, multi-agent flows, error handling) in interviews. [web:16][web:28][web:39]

---

## 7. Security, privacy, and Responsible AI

This is a personal PoC, but it is designed to demonstrate a **Responsible AI mindset**, as requested in the job description: [web:16][web:28][web:37]

- **Data minimization**  
  - Only campaign‑related content is stored.  
  - PII detection highlights emails/phones/names so they can be redacted or handled carefully.  

- **Access governance**  
  - Simple role model (`GLOBAL_MARKETING`, `LOCAL_MARKET`, `LEGAL_REVIEW`) with UI restrictions.  
  - In a real deployment this maps to Azure AD roles / groups.  

- **Auditability**  
  - Every agent run and human decision is logged with timestamps, actions, and “before/after” snippets.  

- **Human‑in‑the‑loop by design**  
  - No content is marked as “final” without explicit review.  
  - Legal/compliance always has the final word for sensitive markets or channels.  

---

## 8. Getting started (local dev)

> Note: adjust commands to your own environment (venv, poetry, pnpm, etc.).

### 8.1 Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # or .venv\Scripts\activate on Windows
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Backend will run on `http://localhost:8000`.  

### 8.2 Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend will run on `http://localhost:5173` (by default).

You can configure the API base URL in a `.env` or config file in `frontend/src`.

---

## 9. Roadmap / possible extensions

Planned or suggested extensions:

- Add **document upload from SharePoint / OneDrive** using Microsoft Graph instead of local files.  
- Host agent logic in **Azure Functions** and integrate with **Power Automate** for approvals. [web:39][web:49]  
- Replace the local LLM client with **Azure OpenAI** and Microsoft Agent Framework providers. [web:36][web:47][web:50]  
- Enrich telemetry with user adoption metrics and A/B tests of different agent prompts.  
- Extend to ESG/sustainability report drafting using campaign and operations data. [web:34][web:49]  

---

## 10. Why this matters for an Agentic AI Productivity Specialist role

This project is intentionally designed to show:

- **Agent design & orchestration**: Multi-step workflow, explicit states, tools, and agents. [web:16][web:28][web:37]  
- **Business alignment**: Solves a realistic productivity problem for global marketing teams at a company like Lavazza. [web:22][web:24][web:26]  
- **Microsoft mindset**: Every component is mapped to Microsoft 365, Power Platform, Azure OpenAI, and agent frameworks. [web:16][web:36][web:39][web:47]  
- **Responsible AI & governance**: PII awareness, logging, human approvals, and audit trail built‑in from day one. [web:16][web:28][web:34][web:49]  
- **End‑to‑end ownership**: From UX and data model to deployment mapping and telemetry, matching the “design, deploy, and run” expectations of the role. [web:16][web:28]  

You can walk through this repo in interviews to demonstrate how you think about **agentic AI productivity solutions** in a real enterprise context.
