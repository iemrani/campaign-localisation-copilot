export const academy = {
  title: "Operations Hub Academy",
  subtitle: "A guided masterclass for the Lavazza Campaign Operations Hub",
  sourceNote:
    "Updated from the current Next.js implementation under app/: operations dashboard, review workspace, audit, telemetry, i18n, Auth.js configuration, storage, agents, and API routes.",
  kpis: [
    { label: "AGENTS", value: "4", detail: "ingest / localise / comply / readiness" },
    { label: "CONTROL SURFACE", value: "v2", detail: "operations hub, review queue, audit, telemetry" },
    { label: "LANGUAGES", value: "EN / IT", detail: "cookie-backed app language selector" }
  ],
  sections: [
    {
      id: "introduction",
      number: "1",
      title: "Introduction",
      kicker: "v2 product story, audience, and campaign lifecycle",
      summary:
        "Understand the upgraded app as a professional campaign operations hub: a central team turns one brief into localised, compliant, reviewed assets with traceability.",
      outcomes: [
        "Explain the business problem in enterprise global marketing terms.",
        "Describe the operations-hub journey from brief intake to reviewed asset packet.",
        "Identify the new v2 surfaces: readiness, review queue, audit, telemetry, theme, and language switching."
      ],
      body: [
        {
          type: "hero",
          eyebrow: "Current app context",
          heading: "Training guide for the Campaign Operations Hub",
          text:
            "The main app is now a polished campaign operations workspace. A central marketer submits a master brief, AI agents extract structure and generate market/channel drafts, compliance checks flag risks, reviewers approve or reject copy, and the system exposes readiness, audit, telemetry, export packets, theme mode, and English/Italian UI switching.",
          flow: ["Brief", "Readiness", "Drafts", "Review", "Audit"]
        },
        {
          type: "timeline",
          title: "Current v2 campaign flow",
          items: [
            {
              label: "Brief",
              title: "Campaign brief is ingested",
              detail:
                "The marketer creates a structured campaign workspace from raw product, message, claim, tone, and call-to-action instructions."
            },
            {
              label: "Ready",
              title: "Command center computes readiness",
              detail:
                "The dashboard summarizes campaign count, draft count, pending review, high-risk flags, and per-campaign readiness."
            },
            {
              label: "Drafts",
              title: "Localised drafts fan out",
              detail:
                "For every selected market and channel, the localisation agent combines market rules, channel constraints, and the brief spec."
            },
            {
              label: "Risk",
              title: "Compliance and RAG flags are attached",
              detail:
                "Deterministic rules and a RAG-grounded LLM reviewer check claims, language laws, pricing rules, tone drift, and policy risks."
            },
            {
              label: "Decision",
              title: "Review, audit, telemetry, and export close the loop",
              detail:
                "Reviewers edit, approve, or reject. Audit events, version history, telemetry counters, and export packets preserve the decision trail."
            }
          ]
        },
        {
          type: "callout",
          title: "What changed in the main app",
          text:
            "The academy now follows the upgraded app: professional operations-hub navigation, portfolio readiness, richer review layout, light/dark support, English/Italian app language selection, Auth.js secret guidance, health checks, and exportable campaign packets."
        }
      ],
      quiz: [
        {
          question: "Which part of the system creates the structured CampaignSpec?",
          answer: "The ingestion agent in src/agents/ingestion.ts, called by POST /api/briefs."
        },
        {
          question: "Why is human approval still required?",
          answer:
            "Generated marketing copy can carry legal, cultural, brand, or factual risk. The system assists, but a human makes the publish decision."
        }
      ]
    },
    {
      id: "user-journeys",
      number: "2",
      title: "User Journeys",
      kicker: "From brief to approved localised asset",
      summary:
        "Trace each user action through UI screens, API routes, database tables, agents, and compliance checks.",
      outcomes: [
        "Follow the happy path from campaign creation to approval.",
        "Map user-facing actions to API endpoints and database writes.",
        "Recognise the human roles represented by the persona picker and Entra identity capture."
      ],
      journeys: [
        {
          step: "Ingestion",
          userAction: "Central marketer pastes a brief on Campaign briefs.",
          api: "POST /api/briefs",
          db: "briefs, audit_events",
          ui: "src/app/page.tsx, src/components/brief-form.tsx",
          code: "src/agents/ingestion.ts",
          explanation:
            "The raw brief is sent to the ingestion agent, which asks the LLM for a JSON campaign spec. Zod validation enforces shape before the brief is stored."
        },
        {
          step: "Localisation",
          userAction: "Marketer selects market and channel combinations.",
          api: "POST /api/drafts",
          db: "drafts, draft_versions",
          ui: "src/app/briefs/[id]/page.tsx, src/components/generate-form.tsx",
          code: "src/agents/localisation.ts",
          explanation:
            "The API fans out across selected combinations and calls the localisation agent for each market/channel pair."
        },
        {
          step: "Compliance",
          userAction: "Compliance runs automatically after each draft is generated or edited.",
          api: "POST /api/drafts, PATCH /api/drafts/[id]",
          db: "flags, audit_events",
          ui: "src/components/draft-card.tsx, src/components/review-panel.tsx",
          code: "src/agents/compliance.ts, src/compliance-rules, src/rag",
          explanation:
            "Rule-based checks run first. Retrieved policy snippets are then sent to the LLM compliance reviewer for additional rationale and risk flags."
        },
        {
          step: "Review",
          userAction: "Reviewer edits, approves, or rejects a draft.",
          api: "GET/PATCH /api/drafts/[id]",
          db: "draft_versions, drafts, flags, audit_events",
          ui: "src/app/review/page.tsx, src/app/review/[id]/page.tsx",
          code: "src/components/review-panel.tsx",
          explanation:
            "Edits create new versions instead of overwriting previous content. Approval and rejection update draft status and write audit rows."
        },
        {
          step: "Telemetry",
          userAction: "Stakeholder opens the telemetry dashboard.",
          api: "GET /api/telemetry",
          db: "drafts, draft_versions, flags, audit_events",
          ui: "src/app/telemetry/page.tsx",
          code: "src/agents/telemetry.ts",
          explanation:
            "The current dashboard aggregates directly from database rows: draft totals, approval status, median decision time, revision rate, top flags, and market breakdown."
        }
      ],
      body: [
        {
          type: "journey"
        }
      ],
      quiz: [
        {
          question: "What happens when a reviewer edits copy?",
          answer:
            "The app inserts a new draft_versions row, reruns compliance for the new version, stores any flags, and logs an audit event."
        }
      ]
    },
    {
      id: "architecture",
      number: "3",
      title: "Architecture Overview",
      kicker: "Components and request flow",
      summary:
        "See the system as connected parts: browser UI, Next.js API routes, agent layer, storage, LLM providers, policy retrieval, identity, and Azure hosting.",
      outcomes: [
        "Explain the role of each major component.",
        "Understand provider switching between Anthropic and Azure OpenAI.",
        "Describe end-to-end request flow in plain language."
      ],
      components: [
        {
          name: "Next.js Frontend",
          role:
            "Server-rendered and client-interactive pages for the operations hub, brief workspace, review queue, audit, telemetry, theme, and language controls."
        },
        {
          name: "API Routes",
          role:
            "HTTP entry points under src/app/api. They validate input, call agents and repositories, and return JSON."
        },
        {
          name: "Agent Layer",
          role:
            "Ingestion, localisation, compliance, telemetry, and readiness functions. This is where agentic behaviour and operational scoring are organised into testable units."
        },
        {
          name: "Drizzle Storage",
          role:
            "Repository functions write briefs, drafts, versions, flags, and audit events to a Postgres-compatible schema."
        },
        {
          name: "LLM Provider",
          role:
            "A provider registry selects Anthropic or Azure OpenAI with the same generateText and generateJson interface."
        },
        {
          name: "Azure Runtime",
          role:
            "Container Apps hosts the Next.js app, Postgres stores state, Azure OpenAI provides production LLM calls, Entra protects sign-in, and App Insights receives telemetry."
        },
        {
          name: "Internationalisation",
          role:
            "A small dictionary layer and cookie-backed language selector switch the main app between English and Italian without changing routes or database state."
        }
      ],
      body: [
        {
          type: "architectureDiagram"
        },
        {
          type: "componentGrid"
        },
        {
          type: "requestFlow",
          title: "End-to-end request flow",
          steps: [
            "A user submits a form in the browser.",
            "A Next.js API route validates the request with Zod.",
            "The route calls an agent or repository function.",
            "Agents may call the selected LLM provider and retrieve policy context.",
            "Repository functions write normalized rows through Drizzle.",
            "The UI renders the updated data and telemetry can aggregate it later."
          ]
        }
      ]
    },
    {
      id: "operations-hub-map",
      number: "4",
      title: "Operations Hub System Map",
      kicker: "A fast visual map of code and data",
      summary:
        "Get the project in your head quickly: which folders make the product, how requests move through the system, and how the database keeps campaign evidence.",
      outcomes: [
        "Recognise the Operations Hub structure without opening every file.",
        "Explain the difference between UI pages, API routes, agents, providers, and storage.",
        "Read the database schema as a campaign evidence chain."
      ],
      componentMap: {
        title: "Interactive Operations Hub Map",
        subtitle: "Hover any node to read its role",
        hint: "Tip: each node maps to a real folder or file in app/src, so this is a quick orientation map before reading code.",
        core: {
          label: "CONTROL CORE",
          title: "Lavazza Campaign Operations Hub",
          detail: "A Next.js app that turns one campaign brief into reviewed, compliant, exportable localised assets."
        },
        components: [
          {
            label: "UI",
            name: "Operations Hub UI",
            file: "src/app",
            tone: "cyan",
            explain:
              "The user-facing surface: operations dashboard, brief workspace, review queue, audit, telemetry, theme toggle, and language selector."
          },
          {
            label: "I18N",
            name: "Language layer",
            file: "src/i18n",
            tone: "cyan",
            explain:
              "Keeps English and Italian UI copy in dictionaries and reads the selected locale from a cookie."
          },
          {
            label: "AUTH",
            name: "Identity layer",
            file: "src/auth",
            tone: "magenta",
            explain:
              "Combines demo personas with production Entra identity so actions can be tied to a reviewer or marketer."
          },
          {
            label: "API",
            name: "Route handlers",
            file: "src/app/api",
            tone: "green",
            explain:
              "The backend boundary. Routes validate input, call agents or repositories, and return JSON or page data."
          },
          {
            label: "AI",
            name: "Agent layer",
            file: "src/agents",
            tone: "primary",
            explain:
              "Organises ingestion, localisation, compliance, telemetry, and readiness logic into focused agent functions."
          },
          {
            label: "LLM",
            name: "Provider switch",
            file: "src/llm",
            tone: "cyan",
            explain:
              "Hides vendor differences behind one interface, so Anthropic and Azure OpenAI can be swapped by configuration."
          },
          {
            label: "RAG",
            name: "Policy retrieval",
            file: "src/rag",
            tone: "amber",
            explain:
              "Finds relevant policy snippets that help the compliance reviewer ground risk checks in project rules."
          },
          {
            label: "RULES",
            name: "Compliance rules",
            file: "src/compliance-rules",
            tone: "amber",
            explain:
              "Deterministic checks for language, claims, length, pricing, and required wording before LLM judgement."
          },
          {
            label: "DB",
            name: "Storage layer",
            file: "src/storage",
            tone: "green",
            explain:
              "Drizzle schema and repository functions for briefs, drafts, versions, flags, and audit events."
          },
          {
            label: "OPS",
            name: "Readiness + telemetry",
            file: "src/agents/readiness.ts",
            tone: "magenta",
            explain:
              "Turns draft, flag, and audit data into dashboard readiness, operational metrics, and production traces."
          }
        ]
      },
      skeleton: {
        title: "Operations Hub architecture map",
        subtitle: "Modern Mermaid-style system map",
        layers: [
          {
            label: "01 / EXPERIENCE",
            name: "User-facing screens",
            tone: "cyan",
            nodes: [
              { name: "Campaign briefs", detail: "Create and open master campaign briefs.", file: "src/app/page.tsx" },
              { name: "Operations dashboard", detail: "Track portfolio readiness, risk, pending review, and active campaigns.", file: "src/app/page.tsx" },
              { name: "Localisation workspace", detail: "Generate market and channel drafts and export campaign packets.", file: "src/app/briefs/[id]/page.tsx" },
              { name: "Review queue", detail: "Approve, reject, edit copy, and inspect flags without layout overflow.", file: "src/app/review/**" },
              { name: "Telemetry + audit", detail: "Inspect outcomes, flags, and accountability events.", file: "src/app/telemetry + audit" }
            ]
          },
          {
            label: "02 / API BOUNDARY",
            name: "Next.js route handlers",
            tone: "green",
            nodes: [
              { name: "Brief API", detail: "Validates raw brief input and stores extracted specs.", file: "api/briefs/route.ts" },
              { name: "Draft API", detail: "Fans out generation across selected market/channel pairs.", file: "api/drafts/route.ts" },
              { name: "Review API", detail: "Handles edit, approve, and reject actions.", file: "api/drafts/[id]/route.ts" },
              { name: "Telemetry API", detail: "Aggregates database rows into dashboard metrics.", file: "api/telemetry/route.ts" },
              { name: "Health + packet APIs", detail: "Expose cloud health checks and downloadable campaign evidence packets.", file: "api/health + api/briefs/[id]/packet" }
            ]
          },
          {
            label: "03 / INTELLIGENCE",
            name: "Agents and policy logic",
            tone: "magenta",
            nodes: [
              { name: "Ingestion agent", detail: "Turns raw brief text into CampaignSpec JSON.", file: "src/agents/ingestion.ts" },
              { name: "Localisation agent", detail: "Creates copy for one market and one channel.", file: "src/agents/localisation.ts" },
              { name: "Compliance agent", detail: "Combines deterministic rules, RAG context, and LLM review.", file: "src/agents/compliance.ts" },
              { name: "Readiness agent", detail: "Computes operations-hub readiness and campaign status.", file: "src/agents/readiness.ts" },
              { name: "Provider registry", detail: "Switches between Anthropic and Azure OpenAI.", file: "src/llm/providers" }
            ]
          },
          {
            label: "04 / PERSISTENCE",
            name: "Repository and schema",
            tone: "amber",
            nodes: [
              { name: "Repository layer", detail: "Small functions that read and write app records.", file: "src/storage/repo.ts" },
              { name: "Drizzle schema", detail: "Postgres-compatible table definitions.", file: "src/storage/schema.ts" },
              { name: "Identity context", detail: "Demo persona plus Entra identity when deployed.", file: "src/auth + middleware.ts" },
              { name: "UI language", detail: "English/Italian copy and locale cookie handling.", file: "src/i18n + language-select.tsx" },
              { name: "Runtime logs", detail: "Structured logs and App Insights in production.", file: "src/obs/logger.ts" }
            ]
          }
        ]
      },
      databaseBlueprint: {
        title: "Database skeleton",
        subtitle: "Campaign evidence chain",
        tables: [
          {
            name: "briefs",
            label: "CAMPAIGN SOURCE",
            kind: "primary",
            fields: ["id", "title", "raw_text", "spec_json", "created_by", "created_at"],
            role: "Stores the original campaign brief and the structured CampaignSpec extracted by the ingestion agent."
          },
          {
            name: "drafts",
            label: "VARIANT HEADER",
            kind: "primary",
            fields: ["id", "brief_id", "market", "channel", "status", "current_version"],
            role: "One row per localised asset target, such as Italian Instagram or German POS."
          },
          {
            name: "draft_versions",
            label: "COPY HISTORY",
            kind: "history",
            fields: ["id", "draft_id", "version", "body", "author_user_id", "author_kind"],
            role: "Preserves every generated or human-edited version instead of overwriting copy."
          },
          {
            name: "flags",
            label: "RISK SIGNALS",
            kind: "risk",
            fields: ["id", "draft_id", "draft_version", "rule_id", "source", "severity"],
            role: "Attaches compliance findings to the exact version that produced the risk."
          },
          {
            name: "audit_events",
            label: "ACCOUNTABILITY",
            kind: "audit",
            fields: ["id", "entity_type", "entity_id", "action", "user_role", "payload_json"],
            role: "Records ingestion, generation, review decisions, and identity context for traceability."
          }
        ],
        relationships: [
          "briefs 1 -> many drafts",
          "drafts 1 -> many draft_versions",
          "drafts 1 -> many flags",
          "briefs/drafts -> audit_events by entity_type + entity_id"
        ]
      },
      insights: [
        {
          label: "MENTAL MODEL",
          title: "The UI is only the control surface",
          text:
            "Most product behaviour lives behind the route handlers: validation, agent calls, database writes, and audit logging."
        },
        {
          label: "WHY IT MATTERS",
          title: "The database stores evidence, not just content",
          text:
            "Version history, compliance flags, and audit events make the app explainable during review and useful for telemetry."
        },
        {
          label: "INTERVIEW ANGLE",
          title: "A clean agentic architecture",
          text:
            "Agents are separated from providers and storage, so Azure OpenAI can replace Anthropic without rewriting the workflow."
        }
      ],
      body: [
        { type: "componentMap" },
        { type: "skeletonDiagram" },
        { type: "databaseBlueprint" },
        { type: "skeletonInsights" }
      ],
      quiz: [
        {
          question: "Where should you look first to understand the app flow?",
          answer: "Start with the page under src/app, then follow its API route, agent function, and repository writes."
        }
      ]
    },
    {
      id: "data-model",
      number: "5",
      title: "Data Model",
      kicker: "What is stored and why",
      summary:
        "Learn the database tables that preserve campaign state, version history, compliance findings, and accountability evidence.",
      outcomes: [
        "Read the schema without needing to be a database expert.",
        "Distinguish briefs, drafts, versions, flags, and audit rows.",
        "Relate the requested Campaign/Market/Channel vocabulary to the actual tables in this repo."
      ],
      entities: [
        {
          name: "briefs",
          friendly: "Campaign",
          fields: ["id", "title", "raw_text", "spec_json", "created_by", "created_at"],
          associations: ["One brief has many drafts."],
          example:
            "A Lavazza global campaign brief for a new coffee product, stored with both raw text and extracted CampaignSpec JSON."
        },
        {
          name: "drafts",
          friendly: "CampaignVariant",
          fields: ["id", "brief_id", "market", "channel", "status", "current_version", "created_at", "updated_at"],
          associations: ["Each draft belongs to one brief and represents one market plus one channel."],
          example:
            "The Italian Instagram caption for a campaign is one draft. The German POS copy is another draft."
        },
        {
          name: "draft_versions",
          friendly: "Versioned content",
          fields: ["id", "draft_id", "version", "body", "author_user_id", "author_kind", "created_at"],
          associations: ["Each draft has one or more immutable versions."],
          example:
            "Version 1 is agent-written. Version 2 might be a local manager edit."
        },
        {
          name: "flags",
          friendly: "Compliance finding",
          fields: ["id", "draft_id", "draft_version", "rule_id", "source", "severity", "message", "suggestion", "excerpt", "created_at"],
          associations: ["Flags attach to a specific draft version."],
          example:
            "A warning from the French Loi Toubon rule or a danger flag for a forbidden claim."
        },
        {
          name: "audit_events",
          friendly: "Review and system log",
          fields: ["id", "entity_type", "entity_id", "action", "user_id", "user_role", "actor_oid", "actor_email", "payload_json", "created_at"],
          associations: ["Audit rows point to briefs or drafts."],
          example:
            "An approved event records the persona role and the real Entra identity when deployed."
        }
      ],
      body: [
        {
          type: "schemaDiagram"
        },
        {
          type: "entityCards"
        },
        {
          type: "callout",
          title: "Mapping requested names to actual schema",
          text:
            "The prompt mentioned Campaign, Market, Channel, CampaignVariant, Review, and RunLog. In the current app, briefs act as campaigns, market and channel are fields on drafts plus registry plugins, drafts act as campaign variants, review decisions are represented by draft status and audit events, and RunLog-style telemetry is represented by audit_events plus runtime logs sent to Application Insights."
        }
      ]
    },
    {
      id: "backend-workflows",
      number: "6",
      title: "Backend Workflows",
      kicker: "Agents, services, failures, and logging",
      summary:
        "Study each workflow as a sequence of entry point, internal steps, database effects, and LLM calls.",
      outcomes: [
        "Understand where the LLM is used and where deterministic code is used.",
        "Explain how validation and error handling reduce silent failures.",
        "Know how audit logs and Application Insights support observability."
      ],
      workflows: [
        {
          name: "Brief Ingestion",
          endpoint: "POST /api/briefs",
          sequence: [
            "Validate title and rawText.",
            "Call ingestBrief(rawText).",
            "LLM returns JSON inside a strict CampaignSpec schema.",
            "Insert row into briefs.",
            "Write audit_events action ingested."
          ],
          failure:
            "If LLM JSON parsing or schema validation fails, the route returns a 500 with the error message and logger records agent.ingest.failed."
        },
        {
          name: "Draft Generation",
          endpoint: "POST /api/drafts",
          sequence: [
            "Validate briefId and market/channel combinations.",
            "Load the brief and parsed CampaignSpec.",
            "Fan out with Promise.all across combinations.",
            "Call localise() with market and channel prompt fragments.",
            "Create draft and draft_versions v1.",
            "Run compliance and insert flags.",
            "Write generated audit event with flag count and rationale."
          ],
          failure:
            "Each combination catches its own error, so one failed market/channel pair does not necessarily fail the whole generation request."
        },
        {
          name: "Compliance Review",
          endpoint: "Internal after generation and edit",
          sequence: [
            "Run deterministic compliance rules.",
            "Retrieve relevant policy excerpts from the local policy corpus.",
            "Ask the LLM compliance reviewer for extra flags and rationale.",
            "Merge rule flags and LLM/RAG flags.",
            "Persist flags for the exact draft version."
          ],
          failure:
            "If the LLM compliance check fails, deterministic rule flags are still returned and the rationale notes the LLM failure."
        },
        {
          name: "Human Review",
          endpoint: "PATCH /api/drafts/[id]",
          sequence: [
            "Validate edit, approve, or reject action.",
            "For edit, create a new immutable version.",
            "For edit, rerun compliance against the new body.",
            "For approve or reject, update draft status.",
            "Write an audit event for the action."
          ],
          failure:
            "Missing draft IDs return 404. Invalid actions return 400. Edits without a body are rejected."
        },
        {
          name: "Telemetry",
          endpoint: "GET /api/telemetry",
          sequence: [
            "Read drafts, versions, flags, and audit events.",
            "Compute totals and approval state.",
            "Calculate median time to decision.",
            "Calculate average revisions per draft.",
            "Group top compliance flags and market approval breakdown."
          ],
          failure:
            "Telemetry depends on database availability. In production, boundary logs are also emitted to Application Insights for operational visibility."
        }
      ],
      body: [
        {
          type: "workflowList"
        }
      ]
    },
    {
      id: "frontend",
      number: "7",
      title: "Frontend Walkthrough",
      kicker: "Screens, actions, endpoints, and state",
      summary:
        "Tour the main screens as a user would experience them, with mockups and endpoint mapping.",
      outcomes: [
        "Know what each page is for.",
        "Connect screens to the backend routes they call.",
        "Understand the high-level state model without React jargon."
      ],
      screens: [
        {
          name: "Operations Hub dashboard",
          route: "/",
          files: "src/app/page.tsx, src/components/brief-form.tsx, src/agents/readiness.ts",
          endpoints: "POST /api/briefs plus server-rendered readiness data",
          actions: "Create a campaign brief, inspect portfolio readiness, open active campaigns, and jump to the review queue.",
          state:
            "The server component computes campaign readiness from briefs, drafts, flags, and decisions. The form posts new brief data and navigates after success."
        },
        {
          name: "Localisation workspace",
          route: "/briefs/[id]",
          files: "src/app/briefs/[id]/page.tsx, src/components/generate-form.tsx",
          endpoints: "POST /api/drafts, GET /api/drafts/[id] through draft cards, GET /api/briefs/[id]/packet",
          actions: "Inspect extracted campaign intelligence, generate drafts, review compliance snapshot, and export the campaign packet.",
          state:
            "The page loads the brief and existing drafts. The generate form sends selected combinations and refreshes the workspace."
        },
        {
          name: "Review and approvals",
          route: "/review, /review/[id]",
          files: "src/app/review/page.tsx, src/app/review/[id]/page.tsx, src/components/review-panel.tsx",
          endpoints: "GET /api/drafts, GET/PATCH /api/drafts/[id]",
          actions: "Filter by reviewer role, inspect wrapped compliance flags, edit content, approve, reject, and preserve a reason for audit.",
          state:
            "Current draft body, flags, version history, and timeline are loaded from storage. Client actions patch the draft and preserve version history."
        },
        {
          name: "Theme and language controls",
          route: "global layout",
          files: "src/app/layout.tsx, src/components/theme-toggle.tsx, src/components/language-select.tsx, src/i18n/**",
          endpoints: "No API endpoint; language uses a cookie and server refresh",
          actions: "Switch light/dark mode and choose English or Italian from the flag dropdown.",
          state:
            "Theme is stored in localStorage. Language is stored in operationsHub.locale so server-rendered labels come back in the selected language."
        },
        {
          name: "Telemetry and audit",
          route: "/telemetry, /audit",
          files: "src/app/telemetry/page.tsx, src/app/audit/page.tsx",
          endpoints: "GET /api/telemetry, GET /api/audit",
          actions: "Review outcome metrics and export or inspect audit rows.",
          state:
            "Metrics are calculated from database rows on render. Production observability also uses App Insights traces."
        }
      ],
      body: [
        {
          type: "screenWalkthrough"
        }
      ]
    },
    {
      id: "azure-devops",
      number: "8",
      title: "Azure Deployment & DevOps",
      kicker: "From GitHub to monitored Azure runtime",
      summary:
        "Connect the codebase to the Azure deployment story: Container Apps, ACR, Azure OpenAI, Postgres, Entra ID, Application Insights, and GitHub Actions OIDC.",
      outcomes: [
        "Explain each Azure resource in the runbook.",
        "Describe the CI/CD path from push to running container.",
        "Identify cost and security guardrails."
      ],
      azure: [
        {
          name: "Azure Container Apps",
          role:
            "Runs the standalone Next.js container with external ingress, scale-to-zero, and revision updates."
        },
        {
          name: "Azure Container Registry",
          role:
            "Stores Docker images built locally or by GitHub Actions. The Container App pulls images using managed identity."
        },
        {
          name: "Azure PostgreSQL Flexible Server",
          role:
            "Production database for Drizzle tables. The runbook uses TLS with sslmode=require."
        },
        {
          name: "Azure OpenAI",
          role:
            "Production LLM provider selected by LLM_PROVIDER=azure-openai and Azure endpoint/deployment environment variables."
        },
        {
          name: "Microsoft Entra ID",
          role:
            "Authenticates real users in production while the demo still records the selected persona role."
        },
        {
          name: "Application Insights",
          role:
            "Receives traces and operational telemetry from the app so agent boundaries and failures are observable."
        },
        {
          name: "GitHub Actions OIDC",
          role:
            "Deploys without long-lived Azure secrets. A federated credential trusts GitHub for the main branch."
        }
      ],
      body: [
        {
          type: "azureDiagram"
        },
        {
          type: "azureCards"
        },
        {
          type: "requestFlow",
          title: "CI/CD narrative",
          steps: [
            "A push lands on main.",
            "The verify job runs npm ci, typecheck, and eval.",
            "GitHub obtains an Azure token through OIDC.",
            "The deploy job builds a Docker image and pushes it to ACR.",
            "Azure Container Apps updates to the new image tag.",
            "Runtime secrets provide database, Azure OpenAI, auth, and App Insights configuration."
          ]
        },
        {
          type: "callout",
          title: "Cost and security guardrails",
          text:
            "The runbook uses Container Apps min replicas 0 for scale-to-zero, a low monthly budget alert, ACR pull through managed identity, Entra sign-in, secret references for credentials, TLS to Postgres, and West Europe region pinning."
        }
      ]
    },
    {
      id: "run-deploy",
      number: "9",
      title: "Run & Deploy for Non-Technical Users",
      kicker: "A practical checklist to run the whole project",
      summary:
        "A plain-language, step-by-step guide for opening the app locally, testing the full demo journey, and understanding the Azure deployment path.",
      outcomes: [
        "Know exactly what needs to be installed before running the app.",
        "Run the local database, app server, migrations, and demo workflow in order.",
        "Understand what the Azure deployment runbook does without needing to be a cloud engineer."
      ],
      runGuide: {
        local: [
          {
            title: "Install the basic tools",
            why: "The app is a web project. It needs Node.js to run the website code, Docker to run the local database, and an LLM key so the agents can generate and check content.",
            commands: [
              "Install Node.js 20 or newer",
              "Install Docker Desktop",
              "Get either an Anthropic API key or Azure OpenAI deployment details"
            ],
            check: "In a terminal, node -v should show version 20 or higher, and docker --version should return a version."
          },
          {
            title: "Open the Operations Hub folder",
            why: "The operational project lives in the app/ folder. The academy is separate and only teaches the project.",
            commands: ["cd app"],
            check: "You should see package.json, Dockerfile, src/, and docs/ in this folder."
          },
          {
            title: "Start the local database",
            why: "The app stores briefs, drafts, versions, flags, and audit events in Postgres. Docker runs Postgres locally so you do not need to install a database manually.",
            commands: ["docker compose up -d"],
            check: "Docker Desktop should show a running Postgres container. The database is available on localhost:5432."
          },
          {
            title: "Install the app dependencies",
            why: "This downloads the JavaScript libraries listed in package.json.",
            commands: ["npm install"],
            check: "The command should finish without errors and create or update node_modules."
          },
          {
            title: "Create the local environment file",
            why: "The app reads secrets and connection settings from .env.local. This file is private and should not be committed.",
            commands: [
              "DATABASE_URL=postgres://copilot:copilot@localhost:5432/copilot",
              "AUTH_SECRET=<generate-a-long-random-secret>",
              "AUTH_ENFORCE=false",
              "LLM_PROVIDER=anthropic",
              "ANTHROPIC_API_KEY=sk-ant-..."
            ],
            check: "AUTH_SECRET prevents the Auth.js MissingSecret warning. If you use Azure OpenAI, replace the Anthropic lines with AZURE_OPENAI_ENDPOINT, AZURE_OPENAI_API_KEY, AZURE_OPENAI_DEPLOYMENT, and AZURE_OPENAI_API_VERSION."
          },
          {
            title: "Prepare the database tables",
            why: "Migrations create the tables the app expects.",
            commands: ["npm run db:migrate"],
            check: "The command should complete before you start the website."
          },
          {
            title: "Start the web app",
            why: "This launches the Next.js development server.",
            commands: ["npm run dev"],
            check: "Open http://localhost:3000. You should see the Campaign Operations Hub dashboard."
          },
          {
            title: "Run the demo journey",
            why: "This proves the whole project works end to end.",
            commands: [
              "Choose Giulia Rossi as Central Marketing",
              "Submit the sample brief or paste your own",
              "Open the brief and generate drafts",
              "Try the English/Italian language dropdown",
              "Switch to Marco Bianchi and review an Italian draft",
              "Edit, approve, or reject a draft",
              "Open Audit and Telemetry to see the recorded activity"
            ],
            check: "You should see drafts, compliance flags, audit rows, and telemetry counters."
          }
        ],
        deploy: [
          {
            title: "Decide whether you really need cloud deployment",
            why: "Local mode is enough for learning and demos. Azure deployment is for a shareable, signed-in, production-like version.",
            commands: ["Use local mode first", "Move to Azure only after the app works locally"],
            check: "You can already complete the demo journey on localhost."
          },
          {
            title: "Create the Azure resources from the runbook",
            why: "The runbook creates the resource group, managed identity, Azure OpenAI, Postgres, App Insights, ACR, and Container Apps environment.",
            commands: ["Follow app/docs/deployment.md sections 0 to 6"],
            check: "Every resource should be in West Europe and visible in the Azure portal."
          },
          {
            title: "Build and publish the container",
            why: "Azure Container Apps runs a Docker image, not your local source folder.",
            commands: ["docker build -t <registry>/operations-hub:0.1.0 .", "docker push <registry>/operations-hub:0.1.0"],
            check: "The image appears in Azure Container Registry."
          },
          {
            title: "Create or update the Container App",
            why: "This connects the image to runtime settings: database URL, Azure OpenAI, Entra sign-in, auth secret, and App Insights.",
            commands: ["Follow app/docs/deployment.md section 8"],
            check: "Azure returns an app URL such as https://<name>.<region>.azurecontainerapps.io."
          },
          {
            title: "Register the Entra redirect URL",
            why: "Microsoft sign-in only works if Entra knows where to send the user after login.",
            commands: ["Add https://<app-url>/api/auth/callback/microsoft-entra-id as the web redirect URI"],
            check: "Opening the app redirects to Microsoft sign-in, then returns to the Operations Hub."
          },
          {
            title: "Run the smoke test",
            why: "The smoke test confirms region, app response, auth gate, active revision, and App Insights traces.",
            commands: ["Follow app/docs/deployment.md section 12"],
            check: "The app responds, sign-in is enforced, and traces appear in Application Insights."
          }
        ],
        troubleshooting: [
          ["Docker is not running", "Open Docker Desktop first, then run docker compose up -d again."],
          ["Database connection fails", "Check DATABASE_URL and confirm the Postgres container is running."],
          ["LLM calls fail", "Check the API key, provider setting, and Azure deployment name if using Azure OpenAI."],
          ["Port 3000 is busy", "Stop the other process or run the app on another port."],
          ["Azure sign-in loops", "Check the Entra redirect URI and AUTH_* environment variables."]
        ]
      },
      body: [
        {
          type: "runGuide"
        }
      ]
    },
    {
      id: "learning-path",
      number: "10",
      title: "Learning Path",
      kicker: "What to study next, mapped to this project",
      summary:
        "A practical study sequence for understanding and improving the app as a data scientist with strong AI experience.",
      outcomes: [
        "Know what to learn first and why.",
        "Tie each topic back to files in this repository.",
        "Avoid abstract study that does not help this portfolio project."
      ],
      learning: [
        {
          topic: "1. Next.js and React fundamentals",
          projectAnchor: "Pages and components under src/app and src/components.",
          study: [
            "Understand server components versus client components.",
            "Trace how a form posts to an API route.",
            "Practice reading component props and state."
          ],
          links: [
            ["Next.js Learn", "https://nextjs.org/learn"],
            ["React Docs: Thinking in React", "https://react.dev/learn/thinking-in-react"]
          ]
        },
        {
          topic: "2. API routes and Zod validation",
          projectAnchor: "src/app/api/**/route.ts and src/core/schemas.ts.",
          study: [
            "Read each route as input validation, business action, storage write, response.",
            "Learn why schemas protect LLM and user input boundaries.",
            "Add one small endpoint locally to build confidence."
          ],
          links: [
            ["Next.js Route Handlers", "https://nextjs.org/docs/app/building-your-application/routing/route-handlers"],
            ["Zod Documentation", "https://zod.dev/"]
          ]
        },
        {
          topic: "3. SQL and Drizzle ORM",
          projectAnchor: "src/storage/schema.ts, src/storage/repo.ts, drizzle/migrations.",
          study: [
            "Learn primary keys, foreign-key-style references, and one-to-many relationships.",
            "Compare schema definitions to migration SQL.",
            "Run small queries against local data."
          ],
          links: [
            ["Drizzle ORM Docs", "https://orm.drizzle.team/docs/overview"],
            ["SQLBolt", "https://sqlbolt.com/"]
          ]
        },
        {
          topic: "4. Agent contracts and LLM providers",
          projectAnchor: "src/agents, src/llm/providers, src/rag.",
          study: [
            "Separate prompts, schemas, provider interfaces, and business workflows.",
            "Understand why deterministic compliance rules run before LLM judgement.",
            "Review how Azure OpenAI swaps in without changing agent code."
          ],
          links: [
            ["Azure OpenAI Documentation", "https://learn.microsoft.com/azure/ai-services/openai/"],
            ["OpenAI Structured Outputs Guide", "https://platform.openai.com/docs/guides/structured-outputs"]
          ]
        },
        {
          topic: "5. Azure Container Apps deployment",
          projectAnchor: "docs/deployment.md, Dockerfile, .github/workflows/deploy.yml if present.",
          study: [
            "Understand container image, registry, runtime environment, and revision.",
            "Learn what each environment variable controls.",
            "Practice reading App Insights traces after a deploy."
          ],
          links: [
            ["Azure Container Apps Docs", "https://learn.microsoft.com/azure/container-apps/"],
            ["GitHub Actions OIDC with Azure", "https://learn.microsoft.com/azure/developer/github/connect-from-azure-openid-connect"]
          ]
        },
        {
          topic: "6. Responsible AI and governance",
          projectAnchor: "docs/responsible-ai.md and compliance rules.",
          study: [
            "Document risks, mitigations, human approval points, and known gaps.",
            "Learn the difference between logging, auditability, and monitoring.",
            "Prepare a concise interview explanation of HITL governance."
          ],
          links: [
            ["Microsoft Responsible AI", "https://www.microsoft.com/ai/responsible-ai"],
            ["EU AI Act overview", "https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai"]
          ]
        }
      ],
      body: [
        {
          type: "learningPath"
        }
      ]
    }
  ],
  sourceMap: [
    ["Architecture diagrams", "app/docs/architecture.md"],
    ["Azure runbook", "app/docs/deployment.md"],
    ["Microsoft mapping", "app/docs/microsoft-mapping.md"],
    ["Responsible AI", "app/docs/responsible-ai.md"],
    ["Schema", "app/src/storage/schema.ts"],
    ["Repository layer", "app/src/storage/repo.ts"],
    ["Ingestion agent", "app/src/agents/ingestion.ts"],
    ["Localisation agent", "app/src/agents/localisation.ts"],
    ["Compliance agent", "app/src/agents/compliance.ts"],
    ["Telemetry agent", "app/src/agents/telemetry.ts"],
    ["Readiness agent", "app/src/agents/readiness.ts"],
    ["Language dictionary", "app/src/i18n/dictionary.ts"],
    ["Brief API", "app/src/app/api/briefs/route.ts"],
    ["Draft API", "app/src/app/api/drafts/route.ts"],
    ["Review API", "app/src/app/api/drafts/[id]/route.ts"],
    ["Health check", "app/src/app/api/health/route.ts"],
    ["Campaign packet export", "app/src/app/api/briefs/[id]/packet/route.ts"]
  ]
};

export const languages = [
  { id: "en", label: "English", shortLabel: "EN", flag: "🇬🇧" },
  { id: "it", label: "Italiano", shortLabel: "IT", flag: "🇮🇹" }
];

export const uiText = {
  en: {
    language: "Language",
    progress: "Learning progress",
    toggleNav: "Toggle navigation",
    menu: "Menu",
    section: "Section",
    completed: "Completed",
    markComplete: "Mark complete",
    outcomes: "You will be able to",
    journeyMap: "Journey map",
    workflowStages: "workflow stages",
    database: "Database",
    componentDiagram: "Component diagram",
    requestPath: "Request path",
    mainAppSkeleton: "Operations Hub map",
    quickSystemMap: "Quick system map",
    interactiveComponentMap: "Interactive component map",
    hoverForExplanation: "Hover or focus a component for a quick explanation",
    databaseSkeleton: "Database skeleton",
    schemaRelationshipMap: "Schema relationship map",
    schemaView: "Schema view",
    currentTables: "Current Drizzle tables",
    campaignSource: "Campaign source",
    oneToMany: "1 to many",
    marketVariant: "Market + channel variant",
    copyHistory: "Immutable copy history",
    complianceFindings: "Compliance findings",
    accountabilityTrail: "Accountability trail",
    associations: "Associations",
    example: "Example",
    failureBehaviour: "Failure behaviour",
    stateModel: "State model",
    deploymentArchitecture: "Deployment architecture",
    mainBranch: "main branch",
    verifyBuild: "verify and build",
    imageRegistry: "image registry",
    nextRuntime: "Next.js runtime",
    azureSupport: "state, intelligence, identity, monitoring",
    projectAnchor: "Project anchor",
    sourceFiles: "Source files used by this academy",
    localRun: "Run locally",
    cloudDeploy: "Deploy to Azure",
    forNonTechnical: "plain-language checklist",
    troubleshooting: "Troubleshooting",
    check: "Check",
    checkUnderstanding: "Check your understanding",
    start: "Start",
    finish: "Finish",
    architectureNodes: [
      ["Browser UI", "Briefs, review, telemetry"],
      ["Next.js API", "Validation and orchestration"],
      ["Agents", "Ingest, localise, comply"],
      ["LLM Provider", "Anthropic or Azure OpenAI"],
      ["Drizzle DB", "Briefs, drafts, flags, audit"],
      ["Azure", "Container Apps and monitoring"]
    ]
  },
  it: {
    language: "Lingua",
    progress: "Progresso",
    toggleNav: "Apri navigazione",
    menu: "Menu",
    section: "Sezione",
    completed: "Completata",
    markComplete: "Segna completata",
    outcomes: "Alla fine saprai",
    journeyMap: "Mappa del percorso",
    workflowStages: "fasi del flusso",
    database: "Database",
    componentDiagram: "Diagramma dei componenti",
    requestPath: "Percorso della richiesta",
    mainAppSkeleton: "Mappa del centro operativo",
    quickSystemMap: "Mappa rapida del sistema",
    interactiveComponentMap: "Mappa componenti interattiva",
    hoverForExplanation: "Passa il mouse o usa il focus su un componente per una spiegazione rapida",
    databaseSkeleton: "Struttura del database",
    schemaRelationshipMap: "Mappa relazioni schema",
    schemaView: "Vista dello schema",
    currentTables: "Tabelle Drizzle attuali",
    campaignSource: "Origine della campagna",
    oneToMany: "1 a molti",
    marketVariant: "Variante per mercato e canale",
    copyHistory: "Storico immutabile dei testi",
    complianceFindings: "Segnalazioni di conformità",
    accountabilityTrail: "Traccia di responsabilità",
    associations: "Relazioni",
    example: "Esempio",
    failureBehaviour: "Gestione degli errori",
    stateModel: "Gestione dello stato",
    deploymentArchitecture: "Architettura di pubblicazione",
    mainBranch: "ramo main",
    verifyBuild: "verifica e creazione pacchetto",
    imageRegistry: "registro immagini",
    nextRuntime: "ambiente di esecuzione Next.js",
    azureSupport: "stato, AI, identità, monitoraggio",
    projectAnchor: "Collegamento al progetto",
    sourceFiles: "File sorgente usati da questa guida",
    localRun: "Esecuzione locale",
    cloudDeploy: "Pubblicazione su Azure",
    forNonTechnical: "checklist in linguaggio semplice",
    troubleshooting: "Risoluzione problemi",
    check: "Controllo",
    checkUnderstanding: "Verifica la comprensione",
    start: "Inizio",
    finish: "Fine",
    architectureNodes: [
      ["Interfaccia browser", "Brief, revisione, telemetria"],
      ["API Next.js", "Validazione e orchestrazione"],
      ["Agenti", "Acquisizione, localizzazione, conformità"],
      ["Fornitore LLM", "Anthropic o Azure OpenAI"],
      ["Database Drizzle", "Brief, bozze, segnalazioni, registro"],
      ["Azure", "Container Apps e monitoraggio"]
    ]
  }
};

const italianSections = {
  introduction: {
    title: "Introduzione",
    kicker: "Problema, pubblico e ciclo di vita della campagna",
    summary:
      "Capire perché esiste il centro operativo: aiutare un team marketing centrale a trasformare un brief globale in asset localizzati e conformi per mercati e canali diversi.",
    outcomes: [
      "Spiegare il problema aziendale nel contesto di marketing globale Lavazza.",
      "Descrivere le cinque fasi dal brief alla bozza approvata.",
      "Capire dove aiutano gli agenti AI e dove resta responsabile la persona."
    ],
    body: [
      {
        type: "hero",
        eyebrow: "Contesto portfolio",
        heading: "Una visita guidata di un sistema agentico di localizzazione",
        text:
          "Il progetto principale è un centro operativo per localizzazione e approvazione campagne. Un marketer centrale inserisce un brief, gli agenti AI estraggono una struttura e generano bozze per mercato e canale, i controlli di conformità segnalano rischi e i revisori locali approvano, modificano o rifiutano con un registro delle decisioni."
      },
      {
        type: "callout",
        title: "Termini inglesi spiegati",
        text:
          "Quando un termine tecnico resta utile in inglese, la guida usa prima la parola italiana: bozza per draft, revisione per review, conformità per compliance, registro eventi per audit, pubblicazione per deploy e area di lavoro per workspace."
      },
      {
        type: "timeline",
        title: "Flusso tipico di una campagna",
        items: [
          { label: "Brief", title: "Il brief viene inserito", detail: "Il marketer fornisce istruzioni: prodotto, messaggi, claim, tono e call to action." },
          { label: "Spec", title: "L'agente estrae una struttura", detail: "Il modello LLM restituisce una CampaignSpec validata, così le fasi successive non dipendono da testo libero." },
          { label: "Bozza", title: "La localizzazione si espande", detail: "Per ogni mercato e canale, l'agente combina regole locali, vincoli del canale e brief." },
          { label: "Rischio", title: "Vengono aggiunte segnalazioni di conformità", detail: "Regole deterministiche e revisore LLM con RAG controllano claim, leggi linguistiche, prezzi, tono e policy." },
          { label: "Decisione", title: "La persona approva e la telemetria registra", detail: "Manager locali o revisori legali modificano, approvano o rifiutano. Registro eventi e stato della bozza alimentano la telemetria." }
        ]
      },
      {
        type: "callout",
        title: "Nota importante sul repository",
        text:
          "Il prompt iniziale citava una vecchia architettura FastAPI più React. Il codice attuale è una app Next.js App Router con route API, Drizzle ORM, schema compatibile Postgres, fornitori LLM intercambiabili e documentazione di pubblicazione su Azure. Questa guida segue il repository attuale."
      }
    ],
    quiz: [
      { question: "Quale parte crea la CampaignSpec strutturata?", answer: "L'agente di acquisizione in src/agents/ingestion.ts, chiamato da POST /api/briefs." },
      { question: "Perché serve ancora approvazione umana?", answer: "Il testo generato può avere rischi legali, culturali, di brand o fattuali. Il sistema assiste, ma la decisione di pubblicazione resta umana." }
    ]
  },
  "user-journeys": {
    title: "Percorsi Utente",
    kicker: "Dal brief all'asset localizzato approvato",
    summary:
      "Segui ogni azione utente attraverso schermate, API, tabelle database, agenti e controlli di conformità.",
    outcomes: [
      "Seguire il percorso ideale dalla creazione campagna all'approvazione.",
      "Collegare azioni utente a endpoint API e scritture database.",
      "Capire i ruoli umani rappresentati dal selettore persona e da Entra ID."
    ],
    journeys: [
      {
        step: "Acquisizione",
        userAction: "Il marketer centrale inserisce un brief nella pagina Campaign briefs.",
        api: "POST /api/briefs",
        db: "briefs, audit_events",
        ui: "src/app/page.tsx, src/components/brief-form.tsx",
        code: "src/agents/ingestion.ts",
        explanation: "Il brief grezzo viene inviato all'agente, che chiede all'LLM una specifica JSON. Zod valida la forma prima del salvataggio."
      },
      {
        step: "Localizzazione",
        userAction: "Il marketer sceglie combinazioni di mercati e canali.",
        api: "POST /api/drafts",
        db: "drafts, draft_versions",
        ui: "src/app/briefs/[id]/page.tsx, src/components/generate-form.tsx",
        code: "src/agents/localisation.ts",
        explanation: "L'API distribuisce il lavoro sulle combinazioni selezionate e chiama l'agente di localizzazione per ogni coppia mercato/canale."
      },
      {
        step: "Conformità",
        userAction: "Il controllo di conformità parte automaticamente dopo generazione o modifica.",
        api: "POST /api/drafts, PATCH /api/drafts/[id]",
        db: "flags, audit_events",
        ui: "src/components/draft-card.tsx, src/components/review-panel.tsx",
        code: "src/agents/compliance.ts, src/compliance-rules, src/rag",
        explanation: "Prima girano le regole deterministiche. Poi estratti di policy vengono inviati al revisore LLM per ulteriori segnalazioni e motivazioni."
      },
      {
        step: "Revisione",
        userAction: "Il revisore modifica, approva o rifiuta una bozza.",
        api: "GET/PATCH /api/drafts/[id]",
        db: "draft_versions, drafts, flags, audit_events",
        ui: "src/app/review/page.tsx, src/app/review/[id]/page.tsx",
        code: "src/components/review-panel.tsx",
        explanation: "Le modifiche creano nuove versioni invece di sovrascrivere. Approvazione e rifiuto aggiornano lo stato e scrivono righe nel registro eventi."
      },
      {
        step: "Telemetria",
        userAction: "Uno stakeholder apre il cruscotto di telemetria.",
        api: "GET /api/telemetry",
        db: "drafts, draft_versions, flags, audit_events",
        ui: "src/app/telemetry/page.tsx",
        code: "src/agents/telemetry.ts",
        explanation: "Il cruscotto aggrega righe database: totale bozze, stato approvazioni, tempo mediano decisione, revisioni, segnalazioni principali e mercati."
      }
    ],
    quiz: [
      { question: "Cosa succede quando un revisore modifica il testo?", answer: "Viene inserita una nuova riga draft_versions, il controllo di conformità gira di nuovo, le segnalazioni vengono salvate e si registra un evento nel registro." }
    ]
  },
  architecture: {
    title: "Panoramica Architetturale",
    kicker: "Componenti e flusso delle richieste",
    summary:
      "Guarda il sistema come parti collegate: interfaccia browser, API Next.js, agenti, archiviazione, fornitori LLM, recupero policy, identità e hosting Azure.",
    outcomes: [
      "Spiegare il ruolo dei componenti principali.",
      "Capire il cambio tra Anthropic e Azure OpenAI.",
      "Descrivere il flusso end-to-end in modo semplice."
    ],
    components: [
      { name: "Interfaccia Next.js", role: "Pagine per brief, revisione, registro eventi e telemetria. I form chiamano route API nello stesso progetto." },
      { name: "Route API", role: "Endpoint HTTP sotto src/app/api. Validano input, chiamano agenti e repository, e restituiscono JSON." },
      { name: "Livello Agenti", role: "Funzioni di acquisizione, localizzazione, conformità e telemetria. Qui il comportamento agentico e organizzato in unità leggibili." },
      { name: "Archiviazione Drizzle", role: "Repository che scrivono brief, bozze, versioni, segnalazioni e registro eventi in uno schema compatibile Postgres." },
      { name: "Fornitore LLM", role: "Un registro seleziona Anthropic o Azure OpenAI con la stessa interfaccia generateText e generateJson." },
      { name: "Ambiente Azure", role: "Container Apps ospita l'app, Postgres salva lo stato, Azure OpenAI fornisce LLM, Entra protegge il login e App Insights monitora." }
    ],
    body: [
      { type: "architectureDiagram" },
      { type: "componentGrid" },
      { type: "requestFlow", title: "Flusso end-to-end", steps: [
        "L'utente invia un form nel browser.",
        "Una route API Next.js valida la richiesta con Zod.",
        "La route chiama un agente o una funzione repository.",
        "Gli agenti possono chiamare il fornitore LLM e recuperare contesto policy.",
        "Le funzioni repository scrivono righe normalizzate con Drizzle.",
        "La UI mostra i dati aggiornati e la telemetria li aggrega."
      ] }
    ]
  },
  "operations-hub-map": {
    title: "Mappa Sistema Operations Hub",
    kicker: "Mappa visiva rapida di codice e dati",
    summary:
      "Capisci il progetto velocemente: quali cartelle costruiscono il prodotto, come le richieste attraversano il sistema e come il database conserva le prove della campagna.",
    outcomes: [
      "Riconoscere la struttura del centro operativo senza aprire ogni file.",
      "Spiegare la differenza tra pagine UI, route API, agenti, fornitori e archiviazione.",
      "Leggere lo schema database come catena di evidenze della campagna."
    ],
    componentMap: {
      title: "Mappa interattiva Operations Hub",
      subtitle: "Passa su ogni nodo per leggerne il ruolo",
      hint: "Suggerimento: ogni nodo punta a una cartella o file reale in app/src, quindi è una mappa rapida prima di leggere il codice.",
      core: {
        label: "NUCLEO DI CONTROLLO",
        title: "Lavazza Campaign Operations Hub",
        detail: "Una app Next.js che trasforma un brief in asset localizzati, conformi, revisionati ed esportabili."
      },
      components: [
        { label: "UI", name: "Interfaccia centro operativo", file: "src/app", tone: "cyan", explain: "La superficie utente: cruscotto operativo, area brief, coda di revisione, registro eventi, telemetria, tema e selettore lingua." },
        { label: "I18N", name: "Lingua", file: "src/i18n", tone: "cyan", explain: "Mantiene testi inglesi e italiani nei dizionari e legge la lingua selezionata da cookie." },
        { label: "AUTH", name: "Identità", file: "src/auth", tone: "magenta", explain: "Combina persone demo e identità Entra in produzione, così ogni azione può essere collegata a marketer o revisore." },
        { label: "API", name: "Gestori route", file: "src/app/api", tone: "green", explain: "Il confine backend. Le route validano input, chiamano agenti o repository e restituiscono JSON o dati pagina." },
        { label: "AI", name: "Livello agenti", file: "src/agents", tone: "primary", explain: "Organizza acquisizione, localizzazione, conformità, telemetria e stato di prontezza in funzioni agente focalizzate." },
        { label: "LLM", name: "Cambio fornitore", file: "src/llm", tone: "cyan", explain: "Nasconde le differenze tra fornitori dietro una sola interfaccia, quindi Anthropic e Azure OpenAI si scambiano via configurazione." },
        { label: "RAG", name: "Recupero policy", file: "src/rag", tone: "amber", explain: "Trova estratti policy rilevanti per aiutare il revisore conformità a controllare i rischi con contesto." },
        { label: "RULES", name: "Regole di conformità", file: "src/compliance-rules", tone: "amber", explain: "Controlli deterministici per lingua, claim, lunghezza, prezzi e parole obbligatorie prima del giudizio LLM." },
        { label: "DB", name: "Archiviazione", file: "src/storage", tone: "green", explain: "Schema Drizzle e repository per brief, bozze, versioni, segnalazioni e registro eventi." },
        { label: "OBS", name: "Telemetria", file: "src/obs + telemetry", tone: "magenta", explain: "Trasforma bozze, segnalazioni e registro eventi in metriche operative; in produzione le tracce vanno ad App Insights." }
      ]
    },
    skeleton: {
      title: "Mappa architetturale Operations Hub",
      subtitle: "Mappa sistema in stile Mermaid moderno",
      layers: [
        {
          label: "01 / ESPERIENZA",
          name: "Schermate utente",
          tone: "cyan",
          nodes: [
            { name: "Brief campagna", detail: "Crea e apre i brief campagna master.", file: "src/app/page.tsx" },
            { name: "Area localizzazione", detail: "Genera bozze per mercati e canali da un brief.", file: "src/app/briefs/[id]/page.tsx" },
            { name: "Coda revisione", detail: "Approva, rifiuta o modifica il testo generato.", file: "src/app/review/**" },
            { name: "Telemetria + registro", detail: "Controlla risultati, segnalazioni ed eventi di responsabilità.", file: "src/app/telemetry + audit" }
          ]
        },
        {
          label: "02 / CONFINE API",
          name: "Gestori route Next.js",
          tone: "green",
          nodes: [
            { name: "API Brief", detail: "Valida il brief e salva la spec estratta.", file: "api/briefs/route.ts" },
            { name: "API bozze", detail: "Distribuisce la generazione sulle coppie mercato/canale.", file: "api/drafts/route.ts" },
            { name: "API revisione", detail: "Gestisce modifica, approvazione e rifiuto.", file: "api/drafts/[id]/route.ts" },
            { name: "API telemetria", detail: "Aggrega righe database in metriche da cruscotto.", file: "api/telemetry/route.ts" }
          ]
        },
        {
          label: "03 / INTELLIGENZA",
          name: "Agenti e logica policy",
          tone: "magenta",
          nodes: [
            { name: "Agente acquisizione", detail: "Trasforma testo libero in CampaignSpec JSON.", file: "src/agents/ingestion.ts" },
            { name: "Agente localizzazione", detail: "Crea testo per un mercato e un canale.", file: "src/agents/localisation.ts" },
            { name: "Agente conformità", detail: "Unisce regole, contesto RAG e revisione LLM.", file: "src/agents/compliance.ts" },
            { name: "Registro fornitori", detail: "Passa da Anthropic ad Azure OpenAI.", file: "src/llm/providers" }
          ]
        },
        {
          label: "04 / PERSISTENZA",
          name: "Repository e schema",
          tone: "amber",
          nodes: [
            { name: "Livello repository", detail: "Funzioni piccole che leggono e scrivono record.", file: "src/storage/repo.ts" },
            { name: "Schema Drizzle", detail: "Definizioni tabelle compatibili Postgres.", file: "src/storage/schema.ts" },
            { name: "Contesto identità", detail: "Persona demo più identità Entra in pubblicazione.", file: "src/auth + middleware.ts" },
            { name: "Log di esecuzione", detail: "Log strutturati e App Insights in produzione.", file: "src/obs/logger.ts" }
          ]
        }
      ]
    },
    databaseBlueprint: {
      title: "Struttura del database",
      subtitle: "Catena di evidenze campagna",
      tables: [
        { name: "briefs", label: "ORIGINE CAMPAGNA", kind: "primary", fields: ["id", "title", "raw_text", "spec_json", "created_by", "created_at"], role: "Salva il brief originale e la CampaignSpec estratta dall'agente di acquisizione." },
        { name: "drafts", label: "VARIANTE", kind: "primary", fields: ["id", "brief_id", "market", "channel", "status", "current_version"], role: "Una riga per ogni asset localizzato, per esempio Instagram Italia o POS Germania." },
        { name: "draft_versions", label: "STORICO TESTI", kind: "history", fields: ["id", "draft_id", "version", "body", "author_user_id", "author_kind"], role: "Conserva ogni versione generata o modificata da una persona senza sovrascrivere." },
        { name: "flags", label: "SEGNALI RISCHIO", kind: "risk", fields: ["id", "draft_id", "draft_version", "rule_id", "source", "severity"], role: "Collega i problemi di conformità alla versione esatta che li ha prodotti." },
        { name: "audit_events", label: "RESPONSABILITÀ", kind: "audit", fields: ["id", "entity_type", "entity_id", "action", "user_role", "payload_json"], role: "Registra acquisizione, generazione, decisioni di revisione e contesto identità." }
      ],
      relationships: [
        "briefs 1 -> molti drafts",
        "drafts 1 -> molte draft_versions",
        "drafts 1 -> molti flags",
        "briefs/drafts -> audit_events tramite entity_type + entity_id"
      ]
    },
    insights: [
      { label: "MODELLO MENTALE", title: "La UI è solo la superficie di controllo", text: "La maggior parte del comportamento vive dietro le route API: validazione, agenti, scritture database e registro eventi." },
      { label: "PERCHÉ CONTA", title: "Il database salva evidenze, non solo contenuto", text: "Versioni, segnalazioni e registro eventi rendono l'app spiegabile durante la revisione e utile per la telemetria." },
      { label: "ANGOLO COLLOQUIO", title: "Architettura agentica pulita", text: "Gli agenti sono separati da fornitori e archiviazione, quindi Azure OpenAI può sostituire Anthropic senza riscrivere il flusso di lavoro." }
    ],
    quiz: [
      { question: "Da dove partire per capire il flusso dell'app?", answer: "Parti dalla pagina in src/app, poi segui route API, funzione agente e scritture repository." }
    ]
  },
  "data-model": {
    title: "Modello Dati",
    kicker: "Cosa viene salvato e perché",
    summary:
      "Impara le tabelle che conservano stato campagna, storico versioni, segnalazioni di conformità e prove di responsabilità.",
    outcomes: [
      "Leggere lo schema senza essere esperto database.",
      "Distinguere brief, bozze, versioni, segnalazioni e registro eventi.",
      "Collegare i nomi richiesti al modello reale nel repo."
    ],
    entities: [
      { name: "briefs", friendly: "Campagna", fields: ["id", "title", "raw_text", "spec_json", "created_by", "created_at"], associations: ["Un brief ha molte bozze."], example: "Un brief globale Lavazza salvato con testo grezzo e CampaignSpec estratta." },
      { name: "drafts", friendly: "Variante Campagna", fields: ["id", "brief_id", "market", "channel", "status", "current_version", "created_at", "updated_at"], associations: ["Ogni bozza appartiene a un brief e rappresenta un mercato più un canale."], example: "La caption Instagram italiana è una bozza. Il testo POS tedesco è un'altra bozza." },
      { name: "draft_versions", friendly: "Contenuto versionato", fields: ["id", "draft_id", "version", "body", "author_user_id", "author_kind", "created_at"], associations: ["Ogni bozza ha una o più versioni immutabili."], example: "Versione 1 scritta dall'agente. Versione 2 modificata da un manager locale." },
      { name: "flags", friendly: "Segnalazione conformità", fields: ["id", "draft_id", "draft_version", "rule_id", "source", "severity", "message", "suggestion", "excerpt", "created_at"], associations: ["Le segnalazioni si collegano a una versione precisa."], example: "Un avviso Loi Toubon o una segnalazione grave per claim vietato." },
      { name: "audit_events", friendly: "Registro revisione e sistema", fields: ["id", "entity_type", "entity_id", "action", "user_id", "user_role", "actor_oid", "actor_email", "payload_json", "created_at"], associations: ["Le righe del registro puntano a brief o bozze."], example: "Un evento approved registra ruolo demo e identità Entra reale in produzione." }
    ],
    body: [
      { type: "schemaDiagram" },
      { type: "entityCards" },
      { type: "callout", title: "Mappatura tra nomi richiesti e schema reale", text: "Campaign corrisponde alla campagna salvata in briefs, Market e Channel sono campi nei drafts e nel registro plugin, CampaignVariant corrisponde alla bozza, Review è rappresentata da stato bozza e audit_events, RunLog è coperto da audit_events e log di esecuzione in Application Insights." }
    ]
  },
  "backend-workflows": {
    title: "Flussi Dietro le Quinte",
    kicker: "Agenti, servizi, errori e registrazione",
    summary: "Studia ogni flusso come sequenza di endpoint, passi interni, effetti database e chiamate LLM.",
    outcomes: [
      "Capire dove si usa l'LLM e dove si usa codice deterministico.",
      "Spiegare come validazione e gestione errori riducono errori silenziosi.",
      "Capire registro eventi e Application Insights."
    ],
    workflows: [
      { name: "Acquisizione Brief", endpoint: "POST /api/briefs", sequence: ["Valida title e rawText.", "Chiama ingestBrief(rawText).", "L'LLM restituisce JSON dentro CampaignSpec.", "Inserisce una riga in briefs.", "Scrive audit_events action ingested."], failure: "Se parsing JSON o validazione schema falliscono, la route restituisce 500 e il logger registra agent.ingest.failed." },
      { name: "Generazione Bozze", endpoint: "POST /api/drafts", sequence: ["Valida briefId e combinazioni mercato/canale.", "Carica brief e CampaignSpec.", "Distribuisce il lavoro con Promise.all.", "Chiama localise() con frammenti prompt.", "Crea una bozza e la prima versione in draft_versions.", "Esegue conformità e salva segnalazioni.", "Scrive l'evento generated nel registro."], failure: "Ogni combinazione gestisce il proprio errore, quindi un singolo fallimento non blocca necessariamente tutto." },
      { name: "Controllo Conformità", endpoint: "Interno dopo generazione e modifica", sequence: ["Esegue regole deterministiche.", "Recupera estratti policy.", "Chiede al revisore LLM ulteriori segnalazioni.", "Unisce segnalazioni da regole e LLM/RAG.", "Salva le segnalazioni sulla versione precisa."], failure: "Se l'LLM fallisce, le segnalazioni deterministiche restano disponibili e la motivazione segnala il problema." },
      { name: "Revisione Umana", endpoint: "PATCH /api/drafts/[id]", sequence: ["Valida modifica, approvazione o rifiuto.", "Per modifica crea una nuova versione.", "Per modifica riesegue conformità.", "Per approvazione/rifiuto aggiorna status.", "Scrive evento nel registro."], failure: "Bozza mancante restituisce 404. Azioni invalide restituiscono 400. Modifica senza body viene rifiutata." },
      { name: "Telemetria", endpoint: "GET /api/telemetry", sequence: ["Legge bozze, versioni, segnalazioni ed eventi del registro.", "Calcola totali e stati.", "Calcola tempo mediano decisione.", "Calcola revisioni medie.", "Raggruppa segnalazioni principali e mercati."], failure: "Dipende dal database. In produzione i log di confine vanno anche in Application Insights." }
    ]
  },
  frontend: {
    title: "Guida Interfaccia",
    kicker: "Schermate, azioni, endpoint e stato",
    summary: "Visita le schermate principali come le vivrebbe un utente, con anteprime e mappa endpoint.",
    outcomes: [
      "Capire a cosa serve ogni pagina.",
      "Collegare schermate alle route backend.",
      "Comprendere lo stato ad alto livello senza gergo React."
    ],
    screens: [
      { name: "Pagina campagne", route: "/", files: "src/app/page.tsx, src/components/brief-form.tsx", endpoints: "GET /api/briefs, POST /api/briefs", actions: "Inserire un brief, inviarlo e aprire brief recenti.", state: "Il componente server carica i brief. Il form client invia dati e naviga dopo successo." },
      { name: "Area localizzazione", route: "/briefs/[id]", files: "src/app/briefs/[id]/page.tsx, src/components/generate-form.tsx", endpoints: "POST /api/drafts, GET /api/drafts/[id] tramite card bozza", actions: "Controllare spec estratta, scegliere mercati/canali, generare bozze e aprire card.", state: "La pagina carica brief e bozze. Il form invia combinazioni e aggiorna l'area." },
      { name: "Revisione e approvazioni", route: "/review, /review/[id]", files: "src/app/review/page.tsx, src/app/review/[id]/page.tsx, src/components/review-panel.tsx", endpoints: "GET /api/drafts, GET/PATCH /api/drafts/[id]", actions: "Filtrare per ruolo, leggere segnalazioni, modificare, approvare o rifiutare.", state: "Testo e segnalazioni sono caricati dall'archiviazione. Le azioni client aggiornano la bozza conservando la storia." },
      { name: "Telemetria e registro", route: "/telemetry, /audit", files: "src/app/telemetry/page.tsx, src/app/audit/page.tsx", endpoints: "GET /api/telemetry, GET /api/audit", actions: "Controllare metriche e righe del registro.", state: "Le metriche sono calcolate dal database al render. In produzione App Insights riceve tracce." }
    ]
  },
  "azure-devops": {
    title: "Pubblicazione Azure e DevOps",
    kicker: "Da GitHub all'ambiente Azure monitorato",
    summary: "Collega il codice alla storia Azure: Container Apps, ACR, Azure OpenAI, Postgres, Entra ID, Application Insights e GitHub Actions OIDC.",
    outcomes: [
      "Spiegare ogni risorsa Azure del runbook.",
      "Descrivere il percorso CI/CD da push a contenitore attivo.",
      "Identificare controlli di costo e sicurezza."
    ],
    azure: [
      { name: "Azure Container Apps", role: "Esegue il container Next.js con ingresso esterno, scale-to-zero e revisioni." },
      { name: "Azure Container Registry", role: "Conserva immagini Docker. Container App le scarica con identità gestita." },
      { name: "Azure PostgreSQL Flexible Server", role: "Database di produzione per le tabelle Drizzle, con TLS sslmode=require." },
      { name: "Azure OpenAI", role: "Fornitore LLM di produzione selezionato con LLM_PROVIDER=azure-openai." },
      { name: "Microsoft Entra ID", role: "Autentica utenti reali mentre la demo registra anche il ruolo persona." },
      { name: "Application Insights", role: "Riceve tracce e telemetria operativa per osservare agenti ed errori." },
      { name: "GitHub Actions OIDC", role: "Pubblicazione senza segreti Azure permanenti, tramite credenziale federata." }
    ],
    body: [
      { type: "azureDiagram" },
      { type: "azureCards" },
      { type: "requestFlow", title: "Narrativa CI/CD", steps: ["Arriva un push su main.", "Il job verify esegue npm ci, typecheck ed eval.", "GitHub ottiene token Azure via OIDC.", "Il job di pubblicazione crea e invia l'immagine Docker in ACR.", "Azure Container Apps aggiorna l'immagine.", "I segreti di esecuzione forniscono database, Azure OpenAI, auth e App Insights."] },
      { type: "callout", title: "Controlli di costo e sicurezza", text: "Il runbook usa min replicas 0 per scale-to-zero, avvisi budget, pull ACR con identità gestita, login Entra, riferimenti ai segreti, TLS verso Postgres e vincolo regione West Europe." }
    ]
  },
  "run-deploy": {
    title: "Eseguire e Pubblicare per Non Tecnici",
    kicker: "Checklist pratica per avviare tutto il progetto",
    summary: "Una guida passo-passo in linguaggio semplice per aprire l'app in locale, testare il percorso demo completo e capire la pubblicazione Azure.",
    outcomes: [
      "Sapere cosa installare prima di avviare l'app.",
      "Eseguire database locale, server app, migrazioni e demo nell'ordine corretto.",
      "Capire cosa fa il runbook Azure senza essere esperto cloud."
    ],
    runGuide: {
      local: [
        { title: "Installa gli strumenti base", why: "L'app è un'applicazione web: serve Node.js per il codice, Docker per il database locale e una chiave LLM per gli agenti.", commands: ["Installa Node.js 20 o superiore", "Installa Docker Desktop", "Prepara una chiave Anthropic oppure i dettagli Azure OpenAI"], check: "node -v deve mostrare 20 o superiore; docker --version deve rispondere." },
        { title: "Apri la cartella Operations Hub", why: "Il progetto operativo vive in app/. La guida è separata e serve solo a spiegare.", commands: ["cd app"], check: "Dovresti vedere package.json, Dockerfile, src/ e docs/." },
        { title: "Avvia il database locale", why: "L'app salva brief, bozze, versioni, segnalazioni e registro eventi in Postgres. Docker lo avvia localmente.", commands: ["docker compose up -d"], check: "Docker Desktop deve mostrare un container Postgres attivo su localhost:5432." },
        { title: "Installa le dipendenze", why: "Scarica le librerie JavaScript indicate in package.json.", commands: ["npm install"], check: "Il comando termina senza errori e crea node_modules." },
        { title: "Crea il file .env.local", why: "L'app legge segreti e connessioni da .env.local. Non va committato.", commands: ["DATABASE_URL=postgres://copilot:copilot@localhost:5432/copilot", "AUTH_SECRET=<genera-un-segreto-lungo>", "AUTH_ENFORCE=false", "LLM_PROVIDER=anthropic", "ANTHROPIC_API_KEY=sk-ant-..."], check: "AUTH_SECRET evita l'avviso Auth.js MissingSecret. Per Azure OpenAI usa invece AZURE_OPENAI_ENDPOINT, AZURE_OPENAI_API_KEY, AZURE_OPENAI_DEPLOYMENT e AZURE_OPENAI_API_VERSION." },
        { title: "Prepara le tabelle database", why: "Le migrazioni creano le tabelle richieste dall'app.", commands: ["npm run db:migrate"], check: "Il comando deve finire prima di avviare il sito." },
        { title: "Avvia l'app web", why: "Lancia il server Next.js di sviluppo.", commands: ["npm run dev"], check: "Apri http://localhost:3000 e cerca il cruscotto Campaign Operations Hub." },
        { title: "Esegui la demo completa", why: "Dimostra che tutto funziona end-to-end.", commands: ["Scegli Giulia Rossi come Central Marketing", "Invia il brief di esempio o il tuo", "Apri il brief e genera bozze", "Prova il menu lingua English/Italiano", "Passa a Marco Bianchi e rivedi una bozza italiana", "Modifica, approva o rifiuta", "Apri Registro e Telemetria"], check: "Dovresti vedere bozze, segnalazioni di conformità, righe registro e contatori telemetria." }
      ],
      deploy: [
        { title: "Decidi se serve davvero il cloud", why: "La modalità locale basta per imparare e fare demo. Azure serve per una versione condivisibile e simile a produzione.", commands: ["Usa prima la modalità locale", "Passa ad Azure solo dopo che localhost funziona"], check: "La demo completa funziona già in locale." },
        { title: "Crea le risorse Azure dal runbook", why: "Il runbook crea gruppo risorse, identità gestita, Azure OpenAI, Postgres, App Insights, ACR e ambiente Container Apps.", commands: ["Segui app/docs/deployment.md sezioni 0-6"], check: "Le risorse devono essere in West Europe e visibili nel portale Azure." },
        { title: "Crea e pubblica il contenitore", why: "Container Apps esegue un'immagine Docker, non la cartella locale.", commands: ["docker build -t <registry>/operations-hub:0.1.0 .", "docker push <registry>/operations-hub:0.1.0"], check: "L'immagine appare in Azure Container Registry." },
        { title: "Crea o aggiorna Container App", why: "Collega immagine e impostazioni di esecuzione: database, Azure OpenAI, Entra, segreto auth e App Insights.", commands: ["Segui app/docs/deployment.md sezione 8"], check: "Azure restituisce una URL pubblica dell'app." },
        { title: "Registra la redirect URL in Entra", why: "Il login Microsoft funziona solo se Entra sa dove rimandare l'utente dopo il login.", commands: ["Aggiungi https://<app-url>/api/auth/callback/microsoft-entra-id"], check: "Aprendo l'app vieni mandato al login Microsoft e poi torni all'Operations Hub." },
        { title: "Esegui il test rapido", why: "Conferma regione, risposta app, controllo auth, revisione attiva e tracce App Insights.", commands: ["Segui app/docs/deployment.md sezione 12"], check: "L'app risponde, il login è attivo e App Insights riceve tracce." }
      ],
      troubleshooting: [
        ["Docker non è avviato", "Apri Docker Desktop e rilancia docker compose up -d."],
        ["Connessione database fallita", "Controlla DATABASE_URL e che il container Postgres sia attivo."],
        ["Chiamate LLM falliscono", "Controlla API key, fornitore e nome deployment Azure se usi Azure OpenAI."],
        ["Porta 3000 occupata", "Ferma l'altro processo o usa un'altra porta."],
        ["Login Azure in loop", "Controlla redirect URI Entra e variabili AUTH_*."]
      ]
    }
  },
  "learning-path": {
    number: "10",
    title: "Percorso di Studio",
    kicker: "Cosa studiare dopo, collegato al progetto",
    summary: "Una sequenza pratica per capire e migliorare l'app come data scientist con forte esperienza AI.",
    outcomes: [
      "Sapere cosa studiare prima e perché.",
      "Collegare ogni tema ai file del repository.",
      "Evitare studio astratto che non aiuta il portfolio."
    ],
    learning: [
      { topic: "1. Fondamenti Next.js e React", projectAnchor: "Pagine e componenti in src/app e src/components.", study: ["Capire server component e client component.", "Seguire come un form chiama una route API.", "Leggere props e stato dei componenti."], links: [["Next.js Learn", "https://nextjs.org/learn"], ["React Docs: Thinking in React", "https://react.dev/learn/thinking-in-react"]] },
      { topic: "2. Route API e validazione Zod", projectAnchor: "src/app/api/**/route.ts e src/core/schemas.ts.", study: ["Leggere ogni route come validazione, azione, archiviazione, risposta.", "Capire perché gli schemi proteggono input utente e LLM.", "Aggiungere un piccolo endpoint per pratica."], links: [["Next.js Route Handlers", "https://nextjs.org/docs/app/building-your-application/routing/route-handlers"], ["Zod Documentation", "https://zod.dev/"]] },
      { topic: "3. SQL e Drizzle ORM", projectAnchor: "src/storage/schema.ts, src/storage/repo.ts, drizzle/migrations.", study: ["Capire primary key e relazioni uno-a-molti.", "Confrontare schema e migration SQL.", "Eseguire piccole query locali."], links: [["Drizzle ORM Docs", "https://orm.drizzle.team/docs/overview"], ["SQLBolt", "https://sqlbolt.com/"]] },
      { topic: "4. Contratti agenti e fornitori LLM", projectAnchor: "src/agents, src/llm/providers, src/rag.", study: ["Separare prompt, schema, fornitore e flusso di lavoro.", "Capire perché le regole deterministiche precedono l'LLM.", "Vedere come Azure OpenAI si sostituisce senza cambiare agenti."], links: [["Azure OpenAI Documentation", "https://learn.microsoft.com/azure/ai-services/openai/"], ["OpenAI Structured Outputs Guide", "https://platform.openai.com/docs/guides/structured-outputs"]] },
      { topic: "5. Pubblicazione Azure Container Apps", projectAnchor: "docs/deployment.md, Dockerfile, workflow GitHub Actions.", study: ["Capire immagine container, registro e revisione.", "Imparare il ruolo delle variabili ambiente.", "Leggere tracce App Insights dopo pubblicazione."], links: [["Azure Container Apps Docs", "https://learn.microsoft.com/azure/container-apps/"], ["GitHub Actions OIDC with Azure", "https://learn.microsoft.com/azure/developer/github/connect-from-azure-openid-connect"]] },
      { topic: "6. AI responsabile e governance", projectAnchor: "docs/responsible-ai.md e regole di conformità.", study: ["Documentare rischi, mitigazioni e approvazione umana.", "Distinguere registrazione, tracciabilità e monitoraggio.", "Preparare una spiegazione pronta per colloquio sulla governance HITL."], links: [["Microsoft Responsible AI", "https://www.microsoft.com/ai/responsible-ai"], ["EU AI Act overview", "https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai"]] }
    ]
  }
};

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function mergeDeep(base, override) {
  if (Array.isArray(override)) return clone(override);
  if (!override || typeof override !== "object") return override ?? clone(base);
  const output = clone(base || {});
  for (const [key, value] of Object.entries(override)) {
    output[key] = mergeDeep(output[key], value);
  }
  return output;
}

export function getAcademy(locale = "en") {
  if (locale !== "it") return academy;
  const localized = clone(academy);
  localized.title = "Accademia Operations Hub";
  localized.subtitle = "Masterclass interattiva per il centro operativo campagne Lavazza";
  localized.sourceNote =
    "Aggiornata dal codice Next.js attuale in app/: centro operativo, revisione, registro eventi, telemetria, i18n, Auth.js, archiviazione, agenti e route API.";
  localized.kpis = [
    { label: "AGENTI", value: "4", detail: "acquisizione / localizzazione / conformità / prontezza" },
    { label: "SUPERFICIE", value: "v2", detail: "centro operativo, revisione, registro, telemetria" },
    { label: "LINGUE", value: "EN / IT", detail: "selettore lingua basato su cookie" }
  ];
  localized.sections = localized.sections.map((section) =>
    italianSections[section.id] ? mergeDeep(section, italianSections[section.id]) : section
  );
  localized.sourceMap = [
    ["Diagrammi architettura", "app/docs/architecture.md"],
    ["Runbook Azure", "app/docs/deployment.md"],
    ["Mappatura Microsoft", "app/docs/microsoft-mapping.md"],
    ["Responsible AI", "app/docs/responsible-ai.md"],
    ["Schema", "app/src/storage/schema.ts"],
    ["Livello repository", "app/src/storage/repo.ts"],
    ["Agente acquisizione", "app/src/agents/ingestion.ts"],
    ["Agente localizzazione", "app/src/agents/localisation.ts"],
    ["Agente conformità", "app/src/agents/compliance.ts"],
    ["Agente telemetria", "app/src/agents/telemetry.ts"],
    ["Agente prontezza", "app/src/agents/readiness.ts"],
    ["Dizionario lingua", "app/src/i18n/dictionary.ts"],
    ["API Brief", "app/src/app/api/briefs/route.ts"],
    ["API bozze", "app/src/app/api/drafts/route.ts"],
    ["API revisione", "app/src/app/api/drafts/[id]/route.ts"],
    ["Health check", "app/src/app/api/health/route.ts"],
    ["Export pacchetto campagna", "app/src/app/api/briefs/[id]/packet/route.ts"]
  ];
  return localized;
}
