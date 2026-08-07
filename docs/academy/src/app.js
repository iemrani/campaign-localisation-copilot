import { getAcademy, languages, uiText } from "./content.js";

const state = {
  locale: localStorage.getItem("academy.locale") || "en",
  theme: localStorage.getItem("academy.theme") || "dark",
  current: null,
  completed: new Set(JSON.parse(localStorage.getItem("academy.completed") || "[]"))
};

const app = document.querySelector("#app");

function save() {
  localStorage.setItem("academy.completed", JSON.stringify([...state.completed]));
  localStorage.setItem("academy.locale", state.locale);
  localStorage.setItem("academy.theme", state.theme);
}

function applyTheme() {
  document.documentElement.dataset.theme = state.theme;
}

function academy() {
  return getAcademy(state.locale);
}

function t(key) {
  return uiText[state.locale]?.[key] || uiText.en[key] || key;
}

function setCurrent(id) {
  const scrollState = {
    contentTop: document.querySelector(".content")?.scrollTop || 0,
    sidebarTop: document.querySelector(".sidebar")?.scrollTop || 0,
    windowX: window.scrollX,
    windowY: window.scrollY
  };
  state.current = id;
  history.replaceState(null, "", `#${id}`);
  render();
  restoreScroll(scrollState);
}

function restoreScroll(scrollState) {
  const apply = () => {
    const content = document.querySelector(".content");
    const sidebar = document.querySelector(".sidebar");
    if (content) content.scrollTop = scrollState.contentTop;
    if (sidebar) sidebar.scrollTop = scrollState.sidebarTop;
    window.scrollTo(scrollState.windowX, scrollState.windowY);
  };

  requestAnimationFrame(() => {
    apply();
    requestAnimationFrame(apply);
  });
  setTimeout(apply, 80);
}

function currentIndex() {
  const data = academy();
  return Math.max(0, data.sections.findIndex((s) => s.id === state.current));
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function pill(text) {
  return `<span class="pill">${escapeHtml(text)}</span>`;
}

function navIcon(id) {
  const icons = {
    introduction: "IN",
    "user-journeys": "UX",
    architecture: "AR",
    "operations-hub-map": "OH",
    "data-model": "DB",
    "backend-workflows": "WF",
    frontend: "UI",
    "azure-devops": "AZ",
    "run-deploy": "GO",
    "learning-path": "LP"
  };
  return icons[id] || "..";
}

function render() {
  applyTheme();
  const data = academy();
  const section = data.sections[currentIndex()];
  const progress = Math.round((state.completed.size / data.sections.length) * 100);

  app.innerHTML = `
    <aside class="sidebar">
      <div class="brand">
        <div class="brand-mark">CA</div>
        <div>
          <div class="brand-title">${data.title}</div>
          <div class="brand-subtitle">TRAINING WORKSPACE</div>
        </div>
      </div>
      <div class="sidebar-status">
        <div><span>MODE</span><strong>TRAINING</strong></div>
        <div><span>MODULES</span><strong>${data.sections.length}</strong></div>
      </div>
      <label class="language-switch" aria-label="${escapeHtml(t("language"))}">
        <span>${escapeHtml(t("language"))}</span>
        <select data-locale-select>
          ${languages.map((language) => `
            <option value="${escapeHtml(language.id)}" ${state.locale === language.id ? "selected" : ""}>
              ${escapeHtml(language.flag)} ${escapeHtml(language.shortLabel)}
            </option>
          `).join("")}
        </select>
      </label>
      <div class="progress-block">
        <div class="progress-top">
          <span>${escapeHtml(t("progress"))}</span>
          <strong>${progress}%</strong>
        </div>
        <div class="progress-track"><div style="width:${progress}%"></div></div>
      </div>
      <nav class="nav">${data.sections.map(renderNavItem).join("")}</nav>
      <div class="source-note">${escapeHtml(data.sourceNote)}</div>
    </aside>
    <main class="content">
      <div class="topbar">
        <button class="icon-button mobile-menu" data-action="menu" aria-label="${escapeHtml(t("toggleNav"))}">${escapeHtml(t("menu"))}</button>
        <div>
          <div class="eyebrow">WORKFLOW TRACE / ${escapeHtml(t("section"))} ${section.number}</div>
          <h1>${escapeHtml(section.title)}</h1>
        </div>
        <div class="topbar-actions">
          <span class="status-chip">MODE: TRAINING</span>
          <span class="status-chip alt">SESSION: ACTIVE</span>
          <button class="theme-toggle" data-action="theme" aria-label="Toggle light and dark mode">
            <span class="theme-toggle-track"><span class="theme-toggle-thumb"></span></span>
            <span>${state.theme === "dark" ? "DARK" : "LIGHT"}</span>
          </button>
          <button class="mark-button" data-action="complete">
            ${state.completed.has(section.id) ? escapeHtml(t("completed")) : escapeHtml(t("markComplete"))}
          </button>
        </div>
      </div>
      <article class="lesson">
        <section class="kpi-strip">
          ${(data.kpis || []).map((item) => `
            <div><span>${escapeHtml(item.label)}</span><strong>${escapeHtml(item.value)}</strong><small>${escapeHtml(item.detail)}</small></div>
          `).join("")}
        </section>
        <section class="lesson-intro">
          <div>
            <p class="kicker">${escapeHtml(section.kicker)}</p>
            <h2>${escapeHtml(section.summary)}</h2>
          </div>
          <div class="outcomes">
            <div class="mini-title">${escapeHtml(t("outcomes"))}</div>
            ${section.outcomes.map((item) => `<div class="check-row"><span>OK</span>${escapeHtml(item)}</div>`).join("")}
          </div>
        </section>
        ${(section.body || []).map((block) => renderBlock(block, section)).join("")}
        ${section.quiz ? renderQuiz(section.quiz) : ""}
        ${renderFooterNav()}
      </article>
    </main>
  `;

  bindEvents();
}

function renderNavItem(section) {
  const active = state.current === section.id ? "active" : "";
  const done = state.completed.has(section.id) ? "done" : "";
  return `
    <button class="nav-item ${active} ${done}" data-id="${section.id}">
      <span class="nav-number">${escapeHtml(navIcon(section.id))}</span>
      <span>
        <strong>${escapeHtml(section.title)}</strong>
        <small>/${section.number.padStart ? section.number.padStart(2, "0") : section.number} ${escapeHtml(section.kicker)}</small>
      </span>
    </button>
  `;
}

function renderBlock(block, section) {
  const renderers = {
    hero: renderHero,
    timeline: renderTimeline,
    callout: renderCallout,
    journey: () => renderJourney(section.journeys),
    architectureDiagram: renderArchitectureDiagram,
    componentMap: () => renderComponentMap(section.componentMap),
    skeletonDiagram: () => renderSkeletonDiagram(section.skeleton),
    databaseBlueprint: () => renderDatabaseBlueprint(section.databaseBlueprint),
    skeletonInsights: () => renderSkeletonInsights(section.insights),
    componentGrid: () => renderCards(section.components),
    requestFlow: renderRequestFlow,
    schemaDiagram: renderSchemaDiagram,
    entityCards: () => renderEntities(section.entities),
    workflowList: () => renderWorkflows(section.workflows),
    screenWalkthrough: () => renderScreens(section.screens),
    azureDiagram: renderAzureDiagram,
    azureCards: () => renderCards(section.azure),
    learningPath: () => renderLearning(section.learning),
    runGuide: () => renderRunGuide(section.runGuide)
  };
  return renderers[block.type]?.(block) || "";
}

function renderHero(block) {
  const flow = block.flow || ["Brief", "Agent", "Draft", "Review", "Telemetry"];
  return `
    <section class="hero-panel">
      <div>
        <p class="eyebrow">${escapeHtml(block.eyebrow)}</p>
        <h2>${escapeHtml(block.heading)}</h2>
        <p>${escapeHtml(block.text)}</p>
      </div>
      <div class="hero-flow" aria-label="System overview">
        ${flow.map((item) => `<span>${escapeHtml(item)}</span>`).join("")}
      </div>
    </section>
  `;
}

function renderTimeline(block) {
  return `
    <section class="panel">
      <div class="section-heading"><h3>${escapeHtml(block.title)}</h3></div>
      <div class="timeline">
        ${block.items.map((item) => `
          <div class="timeline-item">
            <div class="timeline-dot">${escapeHtml(item.label)}</div>
            <div>
              <h4>${escapeHtml(item.title)}</h4>
              <p>${escapeHtml(item.detail)}</p>
            </div>
          </div>
        `).join("")}
      </div>
    </section>
  `;
}

function renderCallout(block) {
  return `
    <section class="callout">
      <strong>${escapeHtml(block.title)}</strong>
      <p>${escapeHtml(block.text)}</p>
    </section>
  `;
}

function renderJourney(journeys = []) {
  return `
    <section class="panel">
      <div class="section-heading">
        <h3>${escapeHtml(t("journeyMap"))}</h3>
        <span>${journeys.length} ${escapeHtml(t("workflowStages"))}</span>
      </div>
      <div class="journey-grid">
        ${journeys.map((item) => `
          <details class="journey-card" open>
            <summary>
              <span>${escapeHtml(item.step)}</span>
              <small>${escapeHtml(item.api)}</small>
            </summary>
            <p>${escapeHtml(item.explanation)}</p>
            <dl>
              <dt>User action</dt><dd>${escapeHtml(item.userAction)}</dd>
              <dt>${escapeHtml(t("database"))}</dt><dd>${escapeHtml(item.db)}</dd>
              <dt>UI</dt><dd>${escapeHtml(item.ui)}</dd>
              <dt>Code</dt><dd>${escapeHtml(item.code)}</dd>
            </dl>
          </details>
        `).join("")}
      </div>
    </section>
  `;
}

function renderArchitectureDiagram() {
  const nodes = t("architectureNodes");
  return `
    <section class="panel">
      <div class="section-heading"><h3>${escapeHtml(t("componentDiagram"))}</h3><span>${escapeHtml(t("requestPath"))}</span></div>
      <div class="flow-diagram">
        ${nodes.map(([title, body], index) => `
          <div class="flow-node">
            <strong>${title}</strong>
            <small>${body}</small>
          </div>
          ${index < nodes.length - 1 ? `<div class="connector">-&gt;</div>` : ""}
        `).join("")}
      </div>
    </section>
  `;
}

function renderComponentMap(map = {}) {
  const defaultPositions = [
    [15, 16], [38, 11], [62, 11], [85, 16],
    [14, 50], [86, 50],
    [18, 83], [40, 88], [60, 88], [82, 83]
  ];
  return `
    <section class="panel component-map-panel">
      <div class="section-heading">
        <h3>${escapeHtml(map.title || t("interactiveComponentMap"))}</h3>
        <span>${escapeHtml(map.subtitle || t("hoverForExplanation"))}</span>
      </div>
      <div class="component-radar" aria-label="${escapeHtml(map.title || t("interactiveComponentMap"))}">
        <svg class="radar-links" aria-hidden="true"></svg>
        <div class="radar-core">
          <span>${escapeHtml(map.core?.label || "CORE")}</span>
          <strong>${escapeHtml(map.core?.title || "Operations Hub")}</strong>
          <small>${escapeHtml(map.core?.detail || "")}</small>
        </div>
        ${(map.components || []).map((component, index) => {
          const [x, y] = defaultPositions[index] || [50, 50];
          return `
          <button
            class="radar-node tone-${escapeHtml(component.tone || "primary")} pos-${index + 1}"
            type="button"
            style="--node-index:${index}; --node-x:${x}%; --node-y:${y}%"
            data-map-node="${index}"
            data-default-x="${x}"
            data-default-y="${y}"
            data-tooltip="${escapeHtml(component.explain)}"
            aria-label="${escapeHtml(`${component.name}: ${component.explain}`)}"
          >
            <span>${escapeHtml(component.label)}</span>
            <strong>${escapeHtml(component.name)}</strong>
            <code>${escapeHtml(component.file)}</code>
          </button>
        `}).join("")}
      </div>
      <p class="map-hint">${escapeHtml(map.hint || t("hoverForExplanation"))}</p>
    </section>
  `;
}

function renderSkeletonDiagram(skeleton = {}) {
  return `
    <section class="panel skeleton-panel">
      <div class="section-heading">
        <h3>${escapeHtml(skeleton.title || t("mainAppSkeleton"))}</h3>
        <span>${escapeHtml(skeleton.subtitle || t("quickSystemMap"))}</span>
      </div>
      <div class="skeleton-map" aria-label="${escapeHtml(t("mainAppSkeleton"))}">
        ${(skeleton.layers || []).map((layer) => `
          <article class="skeleton-layer ${escapeHtml(layer.tone || "")}">
            <div class="layer-header">
              <span>${escapeHtml(layer.label)}</span>
              <strong>${escapeHtml(layer.name)}</strong>
            </div>
            <div class="layer-nodes">
              ${(layer.nodes || []).map((node) => `
                <div class="skeleton-node">
                  <strong>${escapeHtml(node.name)}</strong>
                  <small>${escapeHtml(node.detail)}</small>
                  <code>${escapeHtml(node.file)}</code>
                </div>
              `).join("")}
            </div>
          </article>
        `).join("")}
      </div>
    </section>
  `;
}

function renderDatabaseBlueprint(blueprint = {}) {
  return `
    <section class="panel database-blueprint-panel">
      <div class="section-heading">
        <h3>${escapeHtml(blueprint.title || t("databaseSkeleton"))}</h3>
        <span>${escapeHtml(blueprint.subtitle || t("schemaRelationshipMap"))}</span>
      </div>
      <div class="database-blueprint" aria-label="${escapeHtml(t("databaseSkeleton"))}">
        ${(blueprint.tables || []).map((table) => `
          <article class="db-table ${escapeHtml(table.kind || "")}">
            <div class="db-table-title">
              <span>${escapeHtml(table.label)}</span>
              <strong>${escapeHtml(table.name)}</strong>
            </div>
            <ul>
              ${(table.fields || []).map((field) => `<li>${escapeHtml(field)}</li>`).join("")}
            </ul>
            <p>${escapeHtml(table.role)}</p>
          </article>
        `).join("")}
      </div>
      <div class="relationship-rail">
        ${(blueprint.relationships || []).map((item) => `<span>${escapeHtml(item)}</span>`).join("")}
      </div>
    </section>
  `;
}

function renderSkeletonInsights(insights = []) {
  return `
    <section class="skeleton-insights">
      ${insights.map((item) => `
        <article class="insight-card">
          <span>${escapeHtml(item.label)}</span>
          <h3>${escapeHtml(item.title)}</h3>
          <p>${escapeHtml(item.text)}</p>
        </article>
      `).join("")}
    </section>
  `;
}

function renderCards(items = []) {
  return `
    <section class="cards-grid">
      ${items.map((item) => `
        <article class="info-card">
          <h3>${escapeHtml(item.name)}</h3>
          <p>${escapeHtml(item.role)}</p>
        </article>
      `).join("")}
    </section>
  `;
}

function renderRequestFlow(block) {
  return `
    <section class="panel">
      <div class="section-heading"><h3>${escapeHtml(block.title)}</h3></div>
      <ol class="number-list">
        ${block.steps.map((step) => `<li>${escapeHtml(step)}</li>`).join("")}
      </ol>
    </section>
  `;
}

function renderSchemaDiagram() {
  return `
    <section class="panel">
      <div class="section-heading"><h3>${escapeHtml(t("schemaView"))}</h3><span>${escapeHtml(t("currentTables"))}</span></div>
      <div class="schema-map">
        <div class="table-box primary"><strong>briefs</strong><span>${escapeHtml(t("campaignSource"))}</span></div>
        <div class="relation">${escapeHtml(t("oneToMany"))}</div>
        <div class="table-box primary"><strong>drafts</strong><span>${escapeHtml(t("marketVariant"))}</span></div>
        <div class="schema-children">
          <div class="table-box"><strong>draft_versions</strong><span>${escapeHtml(t("copyHistory"))}</span></div>
          <div class="table-box"><strong>flags</strong><span>${escapeHtml(t("complianceFindings"))}</span></div>
          <div class="table-box"><strong>audit_events</strong><span>${escapeHtml(t("accountabilityTrail"))}</span></div>
        </div>
      </div>
    </section>
  `;
}

function renderEntities(entities = []) {
  return `
    <section class="entity-list">
      ${entities.map((entity) => `
        <details class="entity-card" open>
          <summary>
            <span>${escapeHtml(entity.friendly)}</span>
            <code>${escapeHtml(entity.name)}</code>
          </summary>
          <div class="field-wrap">${entity.fields.map(pill).join("")}</div>
          <p><strong>${escapeHtml(t("associations"))}:</strong> ${escapeHtml(entity.associations.join(" "))}</p>
          <p><strong>${escapeHtml(t("example"))}:</strong> ${escapeHtml(entity.example)}</p>
        </details>
      `).join("")}
    </section>
  `;
}

function renderWorkflows(workflows = []) {
  return `
    <section class="workflow-list">
      ${workflows.map((workflow) => `
        <article class="workflow-card">
          <div class="workflow-head">
            <h3>${escapeHtml(workflow.name)}</h3>
            <code>${escapeHtml(workflow.endpoint)}</code>
          </div>
          <ol class="number-list compact">
            ${workflow.sequence.map((step) => `<li>${escapeHtml(step)}</li>`).join("")}
          </ol>
          <div class="failure"><strong>${escapeHtml(t("failureBehaviour"))}:</strong> ${escapeHtml(workflow.failure)}</div>
        </article>
      `).join("")}
    </section>
  `;
}

function renderScreens(screens = []) {
  return `
    <section class="screen-list">
      ${screens.map((screen) => `
        <article class="screen-card">
          <div class="mockup">
            <div class="mockup-bar"><span></span><span></span><span></span></div>
            <div class="mockup-title">${escapeHtml(screen.name)}</div>
            <div class="mockup-lines"><i></i><i></i><i></i></div>
          </div>
          <div class="screen-copy">
            <p class="eyebrow">${escapeHtml(screen.route)}</p>
            <h3>${escapeHtml(screen.name)}</h3>
            <p>${escapeHtml(screen.actions)}</p>
            <dl>
              <dt>Files</dt><dd>${escapeHtml(screen.files)}</dd>
              <dt>Endpoints</dt><dd>${escapeHtml(screen.endpoints)}</dd>
              <dt>${escapeHtml(t("stateModel"))}</dt><dd>${escapeHtml(screen.state)}</dd>
            </dl>
          </div>
        </article>
      `).join("")}
    </section>
  `;
}

function renderAzureDiagram() {
  return `
    <section class="panel">
      <div class="section-heading"><h3>${escapeHtml(t("deploymentArchitecture"))}</h3><span>GitHub to Azure</span></div>
      <div class="azure-flow">
        <div>GitHub<br><small>${escapeHtml(t("mainBranch"))}</small></div>
        <div>Actions<br><small>${escapeHtml(t("verifyBuild"))}</small></div>
        <div>ACR<br><small>${escapeHtml(t("imageRegistry"))}</small></div>
        <div>Container Apps<br><small>${escapeHtml(t("nextRuntime"))}</small></div>
        <div class="wide">Postgres + Azure OpenAI + Entra + App Insights<br><small>${escapeHtml(t("azureSupport"))}</small></div>
      </div>
    </section>
  `;
}

function renderLearning(items = []) {
  return `
    <section class="learning-list">
      ${items.map((item) => `
        <article class="learning-card">
          <h3>${escapeHtml(item.topic)}</h3>
          <p><strong>${escapeHtml(t("projectAnchor"))}:</strong> ${escapeHtml(item.projectAnchor)}</p>
          <ul>${item.study.map((s) => `<li>${escapeHtml(s)}</li>`).join("")}</ul>
          <div class="link-row">
            ${item.links.map(([label, href]) => `<a href="${escapeHtml(href)}" target="_blank" rel="noreferrer">${escapeHtml(label)}</a>`).join("")}
          </div>
        </article>
      `).join("")}
      <section class="panel">
        <div class="section-heading"><h3>${escapeHtml(t("sourceFiles"))}</h3></div>
        <div class="source-grid">
          ${academy().sourceMap.map(([label, file]) => `<div><strong>${escapeHtml(label)}</strong><code>${escapeHtml(file)}</code></div>`).join("")}
        </div>
      </section>
    </section>
  `;
}

function renderRunGuide(guide) {
  return `
    <section class="panel">
      <div class="section-heading"><h3>${escapeHtml(t("localRun"))}</h3><span>${escapeHtml(t("forNonTechnical"))}</span></div>
      <div class="run-steps">${guide.local.map(renderRunStep).join("")}</div>
    </section>
    <section class="panel">
      <div class="section-heading"><h3>${escapeHtml(t("cloudDeploy"))}</h3><span>Azure</span></div>
      <div class="run-steps">${guide.deploy.map(renderRunStep).join("")}</div>
    </section>
    <section class="panel">
      <div class="section-heading"><h3>${escapeHtml(t("troubleshooting"))}</h3></div>
      <div class="trouble-grid">
        ${guide.troubleshooting.map(([problem, fix]) => `
          <div>
            <strong>${escapeHtml(problem)}</strong>
            <p>${escapeHtml(fix)}</p>
          </div>
        `).join("")}
      </div>
    </section>
  `;
}

function renderRunStep(step, index) {
  return `
    <article class="run-step">
      <div class="run-number">${index + 1}</div>
      <div>
        <h4>${escapeHtml(step.title)}</h4>
        <p>${escapeHtml(step.why)}</p>
        <div class="command-list">
          ${step.commands.map((command) => `<code>${escapeHtml(command)}</code>`).join("")}
        </div>
        <div class="check-note"><strong>${escapeHtml(t("check"))}:</strong> ${escapeHtml(step.check)}</div>
      </div>
    </article>
  `;
}

function renderQuiz(quiz) {
  return `
    <section class="panel quiz">
      <div class="section-heading"><h3>${escapeHtml(t("checkUnderstanding"))}</h3></div>
      ${quiz.map((item) => `
        <details>
          <summary>${escapeHtml(item.question)}</summary>
          <p>${escapeHtml(item.answer)}</p>
        </details>
      `).join("")}
    </section>
  `;
}

function renderFooterNav() {
  const data = academy();
  const index = currentIndex();
  const prev = data.sections[index - 1];
  const next = data.sections[index + 1];
  return `
    <section class="footer-nav">
      <button ${prev ? "" : "disabled"} data-id="${prev?.id || ""}">&lt;- ${prev ? escapeHtml(prev.title) : escapeHtml(t("start"))}</button>
      <button ${next ? "" : "disabled"} data-id="${next?.id || ""}">${next ? escapeHtml(next.title) : escapeHtml(t("finish"))} -&gt;</button>
    </section>
  `;
}

function bindEvents() {
  document.querySelectorAll("[data-id]").forEach((button) => {
    button.addEventListener("click", () => {
      const id = button.getAttribute("data-id");
      if (id) setCurrent(id);
      document.body.classList.remove("nav-open");
    });
  });

  document.querySelector('[data-action="complete"]')?.addEventListener("click", () => {
    if (state.completed.has(state.current)) {
      state.completed.delete(state.current);
    } else {
      state.completed.add(state.current);
    }
    save();
    render();
  });

  document.querySelector('[data-action="menu"]')?.addEventListener("click", () => {
    document.body.classList.toggle("nav-open");
  });

  document.querySelector('[data-action="theme"]')?.addEventListener("click", () => {
    state.theme = state.theme === "dark" ? "light" : "dark";
    save();
    render();
  });

  document.querySelector("[data-locale-select]")?.addEventListener("change", (event) => {
      state.locale = event.target.value || "en";
      const data = academy();
      if (!data.sections.some((section) => section.id === state.current)) {
        state.current = data.sections[0].id;
      }
      save();
      render();
  });

  initDraggableComponentMap();
}

function initDraggableComponentMap() {
  const map = document.querySelector(".component-radar");
  if (!map || window.matchMedia("(max-width: 760px)").matches) return;

  const core = map.querySelector(".radar-core");
  const links = map.querySelector(".radar-links");
  const nodes = [...map.querySelectorAll("[data-map-node]")];
  if (!core || !links || nodes.length === 0) return;

  const saved = JSON.parse(localStorage.getItem("academy.componentMap.positions") || "{}");

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function setNodePosition(node, x, y) {
    node.style.left = `${x}px`;
    node.style.top = `${y}px`;
  }

  function centerOf(element) {
    const mapBox = map.getBoundingClientRect();
    const box = element.getBoundingClientRect();
    return {
      x: box.left - mapBox.left + box.width / 2,
      y: box.top - mapBox.top + box.height / 2
    };
  }

  function updateLinks() {
    const mapBox = map.getBoundingClientRect();
    const coreCenter = centerOf(core);
    links.setAttribute("viewBox", `0 0 ${mapBox.width} ${mapBox.height}`);
    links.innerHTML = nodes.map((node) => {
      const nodeCenter = centerOf(node);
      return `<line x1="${coreCenter.x}" y1="${coreCenter.y}" x2="${nodeCenter.x}" y2="${nodeCenter.y}" />`;
    }).join("");
  }

  nodes.forEach((node) => {
    const id = node.getAttribute("data-map-node");
    const defaultX = Number(node.getAttribute("data-default-x") || 50);
    const defaultY = Number(node.getAttribute("data-default-y") || 50);
    const mapBox = map.getBoundingClientRect();
    const stored = saved[id];
    const x = stored?.x ?? (mapBox.width * defaultX) / 100;
    const y = stored?.y ?? (mapBox.height * defaultY) / 100;
    setNodePosition(node, x, y);

    node.addEventListener("pointerdown", (event) => {
      if (event.button !== 0) return;
      event.preventDefault();
      node.setPointerCapture(event.pointerId);
      node.classList.add("dragging");

      const start = {
        pointerX: event.clientX,
        pointerY: event.clientY,
        nodeX: parseFloat(node.style.left || "0"),
        nodeY: parseFloat(node.style.top || "0")
      };

      function move(moveEvent) {
        const box = map.getBoundingClientRect();
        const nodeBox = node.getBoundingClientRect();
        const nextX = clamp(start.nodeX + moveEvent.clientX - start.pointerX, nodeBox.width / 2, box.width - nodeBox.width / 2);
        const nextY = clamp(start.nodeY + moveEvent.clientY - start.pointerY, nodeBox.height / 2, box.height - nodeBox.height / 2);
        setNodePosition(node, nextX, nextY);
        updateLinks();
      }

      function stop() {
        node.classList.remove("dragging");
        node.removeEventListener("pointermove", move);
        node.removeEventListener("pointerup", stop);
        node.removeEventListener("pointercancel", stop);
        const nextSaved = JSON.parse(localStorage.getItem("academy.componentMap.positions") || "{}");
        nextSaved[id] = {
          x: parseFloat(node.style.left || "0"),
          y: parseFloat(node.style.top || "0")
        };
        localStorage.setItem("academy.componentMap.positions", JSON.stringify(nextSaved));
      }

      node.addEventListener("pointermove", move);
      node.addEventListener("pointerup", stop);
      node.addEventListener("pointercancel", stop);
    });
  });

  updateLinks();
  window.addEventListener("resize", updateLinks, { passive: true });
}

const initial = location.hash.replace("#", "");
if (academy().sections.some((section) => section.id === initial)) {
  state.current = initial;
} else {
  state.current = academy().sections[0].id;
}

applyTheme();
render();
