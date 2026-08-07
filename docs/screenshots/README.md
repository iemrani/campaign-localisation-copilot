# Screenshots

Captured 2026-08-07 from the live deployment, not from local dev. Every screen shows
real data produced by a real run: one brief ingested, extracted by the model, then nine
localised drafts generated across three markets and three channels, each passed through
the compliance checker.

Viewport 1600px wide at 2x device pixel ratio.

| File | Screen | What it shows |
|---|---|---|
| `01-home-intake.png` | Campaigns | Five-stage pipeline, portfolio counters, brief intake form |
| `02-campaign-workspace.png` | Campaign workspace | Model-extracted campaign intelligence: product, tone, key messages, mandatory and forbidden claims |
| `03-localised-drafts-compliance.png` | Drafts | Nine generated assets in Italian, French and German with per-version compliance flags |
| `04-review-queue.png` | Review queue | Human approval workflow, pending items by market |
| `05-audit-log.png` | Audit log | Append-only trail: actor, entity, action, payload, timestamp. CSV export |
| `06-telemetry.png` | Telemetry | Run metrics |
| `07-review-detail.png` | Review detail | Single asset with flags and approve or reject controls |
| `08-light-mode.png` | Campaigns, light theme | Theme switching |
| `09-italian-ui.png` | Campaigns, Italian UI | Interface localisation, distinct from content localisation |

## Note on the sample data

The brief used is the one shipped in the repo as the default sample. Mandatory claims
("100% Arabica", "Rainforest Alliance certified") and forbidden claims ("boosts immunity",
"antioxidant", "best in the world") are declared in that brief, and the flags visible in
`03` are the compliance checker acting on them.
