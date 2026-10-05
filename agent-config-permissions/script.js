const STORE_KEY = "agentConfigPermissions.v1";

const PERMISSIONS = [
  { group: "Data", items: [
    { id: "read_files",  label: "Read files",        desc: "Open and read documents in connected storage.", risk: "low" },
    { id: "write_files", label: "Edit files",        desc: "Create, change, or delete documents.",          risk: "medium" },
    { id: "read_db",     label: "Query databases",   desc: "Run read-only queries.",                        risk: "low" }
  ]},
  { group: "Communication", items: [
    { id: "send_email",  label: "Send email",        desc: "Send messages on your behalf.",                 risk: "high" },
    { id: "post_chat",   label: "Post to team chat", desc: "Write messages in shared channels.",            risk: "medium" }
  ]},
  { group: "System", items: [
    { id: "browse_web",  label: "Browse the web",    desc: "Visit pages and fetch content.",                risk: "low" },
    { id: "run_code",    label: "Run code",          desc: "Execute scripts in a sandbox.",                 risk: "high" },
    { id: "spend_money", label: "Make payments",     desc: "Use the connected company card.",               risk: "high" }
  ]}
];

const ALL_IDS = PERMISSIONS.flatMap(g => g.items.map(i => i.id));
const PRESETS = {
  readonly: ["read_files", "read_db", "browse_web"],
  standard: ["read_files", "write_files", "read_db", "post_chat", "browse_web"],
  full: ALL_IDS
};

const DEFAULT_AGENTS = [
  { id: "research",  name: "Research Agent",  role: "Finds and summarizes sources.",       enabled: true,  model: "Balanced", temperature: 0.4, maxSteps: 25, perms: PRESETS.readonly },
  { id: "support",   name: "Support Agent",   role: "Answers customer tickets.",           enabled: true,  model: "Fast",     temperature: 0.3, maxSteps: 15, perms: ["read_files", "read_db", "send_email"] },
  { id: "ops",       name: "Operations Agent",role: "Runs routine maintenance jobs.",      enabled: false, model: "Thorough", temperature: 0.1, maxSteps: 50, perms: ["read_files", "write_files", "run_code"] }
];

const $ = id => document.getElementById(id);
const clone = o => JSON.parse(JSON.stringify(o));

let saved = load();          // last saved state
let draft = clone(saved);    // working copy
let currentId = draft[0].id;

function load() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) { /* storage unavailable */ }
  return clone(DEFAULT_AGENTS);
}

function persist() {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(saved)); } catch (e) {}
}

const current = () => draft.find(a => a.id === currentId);
const isDirty = () => JSON.stringify(draft) !== JSON.stringify(saved);

function renderList() {
  $("agentList").innerHTML = draft.map(a => `
    <li><button type="button" data-id="${a.id}" class="${a.enabled ? "" : "off"}"
      ${a.id === currentId ? 'aria-current="true"' : ""}>
      ${a.name}<small>${a.enabled ? a.perms.length + " permissions" : "Disabled"}</small>
    </button></li>`).join("");
}

function renderPanel() {
  const a = current();
  $("agentName").textContent = a.name;
  $("agentRole").textContent = a.role;
  $("enabled").checked = a.enabled;
  $("model").value = a.model;
  $("temperature").value = a.temperature;
  $("tempOut").textContent = a.temperature;
  $("maxSteps").value = a.maxSteps;
  $("permGroups").classList.toggle("disabled-area", !a.enabled);

  $("permGroups").innerHTML = PERMISSIONS.map(g => `
    <div class="group"><h4>${g.group}</h4>
    ${g.items.map(p => `
      <div class="perm">
        <div><p><strong>${p.label}</strong><span class="risk ${p.risk}">${p.risk} risk</span></p>
        <p class="desc">${p.desc}</p></div>
        <input type="checkbox" class="switch" data-perm="${p.id}" aria-label="${p.label}"
          ${a.perms.includes(p.id) ? "checked" : ""}>
      </div>`).join("")}
    </div>`).join("");
}

function refresh() {
  renderList();
  renderPanel();
  updateBar();
}

function updateBar() {
  $("savebar").hidden = !isDirty();
}

function toast(msg) {
  const t = $("toast");
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 2000);
}

// Events
$("agentList").addEventListener("click", e => {
  const btn = e.target.closest("button[data-id]");
  if (!btn) return;
  currentId = btn.dataset.id;
  refresh();
});

$("enabled").addEventListener("change", e => {
  current().enabled = e.target.checked;
  refresh();
});
$("model").addEventListener("change", e => { current().model = e.target.value; updateBar(); });
$("temperature").addEventListener("input", e => {
  current().temperature = Number(e.target.value);
  $("tempOut").textContent = e.target.value;
  updateBar();
});
$("maxSteps").addEventListener("change", e => {
  const v = Math.min(100, Math.max(1, parseInt(e.target.value, 10) || 1));
  current().maxSteps = v;
  e.target.value = v;
  updateBar();
});

$("permGroups").addEventListener("change", e => {
  const id = e.target.dataset.perm;
  if (!id) return;
  const a = current();
  const meta = PERMISSIONS.flatMap(g => g.items).find(p => p.id === id);
  if (e.target.checked) {
    if (meta.risk === "high" && !confirm(`Allow "${meta.label}"? This is a high-risk permission.`)) {
      e.target.checked = false;
      return;
    }
    a.perms.push(id);
  } else {
    a.perms = a.perms.filter(p => p !== id);
  }
  renderList();
  updateBar();
});

document.querySelector(".presets").addEventListener("click", e => {
  const preset = e.target.dataset.preset;
  if (!preset) return;
  if (preset === "full" && !confirm("Give this agent every permission, including high-risk ones?")) return;
  current().perms = [...PRESETS[preset]];
  refresh();
});

$("saveBtn").addEventListener("click", () => {
  saved = clone(draft);
  persist();
  updateBar();
  toast("Changes saved");
});

$("resetBtn").addEventListener("click", () => {
  draft = clone(saved);
  if (!draft.some(a => a.id === currentId)) currentId = draft[0].id;
  refresh();
  toast("Changes discarded");
});

window.addEventListener("beforeunload", e => {
  if (isDirty()) { e.preventDefault(); e.returnValue = ""; }
});

refresh();
