const activities = [
  {id:"EVT-8F21",agent:"Atlas",role:"Research agent",action:"Completed competitor research",detail:"Collected 18 verified sources and generated a concise market summary.",trigger:"Scheduled",status:"success",duration:"2.8s",time:"Just now",ago:0},
  {id:"EVT-8F20",agent:"Nova",role:"Support agent",action:"Generated support response",detail:"Drafted a response for ticket #4821 and routed it for approval.",trigger:"Ticket #4821",status:"running",duration:"1.2s",time:"32s ago",ago:32},
  {id:"EVT-8F19",agent:"Pulse",role:"Analytics agent",action:"Detected conversion anomaly",detail:"Checkout conversion dropped 14.2% in the mobile segment.",trigger:"Monitor",status:"warning",duration:"3.6s",time:"2m ago",ago:120},
  {id:"EVT-8F18",agent:"Echo",role:"Content agent",action:"Published weekly summary",detail:"Compiled product updates and published the approved workspace digest.",trigger:"Workflow",status:"success",duration:"4.1s",time:"4m ago",ago:240},
  {id:"EVT-8F17",agent:"Scout",role:"Research agent",action:"Enriched lead profile",detail:"Matched company firmographics and added six verified attributes.",trigger:"CRM webhook",status:"success",duration:"1.8s",time:"7m ago",ago:420},
  {id:"EVT-8F16",agent:"Atlas",role:"Research agent",action:"Started source verification",detail:"Validating citations for the quarterly industry report.",trigger:"Manual",status:"running",duration:"0.9s",time:"9m ago",ago:540},
  {id:"EVT-8F15",agent:"Nova",role:"Support agent",action:"Escalation policy triggered",detail:"Confidence fell below 72%; handoff requested from a human reviewer.",trigger:"Policy",status:"warning",duration:"2.2s",time:"13m ago",ago:780},
  {id:"EVT-8F14",agent:"Pulse",role:"Analytics agent",action:"Model query completed",detail:"Calculated retention cohorts for the last 90 days.",trigger:"Dashboard",status:"success",duration:"2.1s",time:"18m ago",ago:1080},
  {id:"EVT-8F13",agent:"Echo",role:"Content agent",action:"Draft generation failed",detail:"Provider timeout after three retries; task queued for recovery.",trigger:"Workflow",status:"failed",duration:"12.4s",time:"22m ago",ago:1320},
  {id:"EVT-8F12",agent:"Scout",role:"Research agent",action:"Lead enrichment completed",detail:"Added intent signals and account context to the CRM record.",trigger:"CRM webhook",status:"success",duration:"1.5s",time:"27m ago",ago:1620},
  {id:"EVT-8F11",agent:"Atlas",role:"Research agent",action:"Summarized new report",detail:"Reduced a 42-page report to an executive brief.",trigger:"Scheduled",status:"success",duration:"3.2s",time:"31m ago",ago:1860},
  {id:"EVT-8F10",agent:"Nova",role:"Support agent",action:"Classified incoming ticket",detail:"Detected billing intent and routed the ticket to Finance.",trigger:"Inbox",status:"success",duration:"0.8s",time:"36m ago",ago:2160}
];

const body = document.getElementById("activityBody");
const empty = document.getElementById("emptyState");
const count = document.getElementById("resultCount");
const search = document.getElementById("searchInput");
const statusFilter = document.getElementById("statusFilter");
const agentFilter = document.getElementById("agentFilter");
const toast = document.getElementById("toast");
const modalBackdrop = document.getElementById("modalBackdrop");
const modalContent = document.getElementById("modalContent");
const modalTitle = document.getElementById("modalTitle");
modalBackdrop.hidden = true;

function avatarClass(agent){ return agent.toLowerCase().replace(" ","-"); }
function statusLabel(status){ return status.charAt(0).toUpperCase()+status.slice(1); }

function render(){
  const q = search.value.trim().toLowerCase();
  const status = statusFilter.value;
  const agent = agentFilter.value;
  const filtered = activities.filter(x => {
    const hay = `${x.id} ${x.agent} ${x.action} ${x.detail} ${x.trigger}`.toLowerCase();
    return (!q || hay.includes(q)) && (status==="all" || x.status===status) && (agent==="all" || x.agent===agent);
  });
  body.innerHTML = filtered.slice(0,8).map(x => `
    <tr>
      <td><div class="agent-cell"><span class="agent-avatar ${avatarClass(x.agent)}">${x.agent[0]}</span><span class="agent-name"><strong>${x.agent}</strong><small>${x.role}</small></span></div></td>
      <td><span class="activity-text"><strong>${x.action}</strong><small>${x.id} · ${x.detail.slice(0,48)}${x.detail.length>48?"…":""}</small></span></td>
      <td><span class="trigger">${x.trigger}</span></td>
      <td><span class="status-pill status-${x.status}"><i></i>${statusLabel(x.status)}</span></td>
      <td><span class="duration">${x.duration}</span></td>
      <td><span class="time">${x.time}</span></td>
      <td><button class="detail-btn" data-id="${x.id}" title="View details" aria-label="View ${x.id}">›</button></td>
    </tr>`).join("");
  empty.hidden = filtered.length !== 0;
  count.textContent = `Showing ${Math.min(filtered.length,8)} of ${filtered.length} matching events`;
}
function showToast(message){
  toast.textContent = message; toast.classList.add("show");
  clearTimeout(window.toastTimer); window.toastTimer = setTimeout(()=>toast.classList.remove("show"),2600);
}
function openDetails(id){
  const x = activities.find(a=>a.id===id);
  if(!x) return;
  modalTitle.textContent = x.action;
  modalContent.innerHTML = "";
  const grid = document.createElement("div");
  grid.className = "detail-grid";
  [
    ["Agent", `${x.agent} · ${x.role}`],
    ["Status", statusLabel(x.status)],
    ["Event ID", x.id],
    ["Duration", x.duration],
    ["Trigger", x.trigger],
    ["Timestamp", x.time]
  ].forEach(([label,value])=>{
    const box=document.createElement("div");
    box.className="detail-box";
    const small=document.createElement("small");
    small.textContent=label;
    const strong=document.createElement("strong");
    strong.textContent=value;
    box.append(small,strong);
    grid.appendChild(box);
  });
  const context=document.createElement("div");
  context.className="detail-box";
  context.style.marginTop="9px";
  const contextLabel=document.createElement("small");
  contextLabel.textContent="Event context";
  const contextText=document.createElement("strong");
  contextText.textContent=x.detail;
  context.append(contextLabel,contextText);
  modalContent.append(grid,context);
  modalBackdrop.hidden=false;
  document.body.style.overflow="hidden";
}
function closeModal(){modalBackdrop.hidden=true;document.body.style.overflow=""}

search.addEventListener("input",render);
statusFilter.addEventListener("change",render);
agentFilter.addEventListener("change",render);
document.getElementById("clearFilters").addEventListener("click",()=>{search.value="";statusFilter.value="all";agentFilter.value="all";render();showToast("Filters cleared");});
body.addEventListener("click",e=>{const btn=e.target.closest(".detail-btn");if(btn)openDetails(btn.dataset.id)});
document.getElementById("modalClose").addEventListener("click",closeModal);
modalBackdrop.addEventListener("click",e=>{if(e.target===modalBackdrop)closeModal()});
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&!modalBackdrop.hidden)closeModal()});


const viewData = {
  agents: {
    title: "Agents",
    text: "Monitor your agent fleet, health and recent activity.",
    body: `<div class="view-grid">
      <article class="view-stat"><span>Active</span><strong>8</strong><small>of 10 agents</small></article>
      <article class="view-stat"><span>Healthy</span><strong>7</strong><small>98%+ health</small></article>
      <article class="view-stat"><span>Attention</span><strong>1</strong><small>Pulse needs review</small></article>
    </div><div class="view-list">
      <button class="view-list-row" data-agent="Atlas"><b>Atlas</b><span>Research agent</span><em class="ok">Healthy</em></button>
      <button class="view-list-row" data-agent="Nova"><b>Nova</b><span>Support agent</span><em class="ok">Healthy</em></button>
      <button class="view-list-row" data-agent="Pulse"><b>Pulse</b><span>Analytics agent</span><em class="warn">Attention</em></button>
      <button class="view-list-row" data-agent="Echo"><b>Echo</b><span>Content agent</span><em class="ok">Healthy</em></button>
    </div>`
  },
  workflows: {
    title: "Workflows",
    text: "Review automation workflows and their latest executions.",
    body: `<div class="view-list">
      <button class="view-list-row" data-workflow="Research digest"><b>Research digest</b><span>Atlas · Daily 09:00</span><em class="ok">Running</em></button>
      <button class="view-list-row" data-workflow="Support triage"><b>Support triage</b><span>Nova · On ticket</span><em class="ok">Active</em></button>
      <button class="view-list-row" data-workflow="Anomaly monitor"><b>Anomaly monitor</b><span>Pulse · Every 5 min</span><em class="warn">Attention</em></button>
      <button class="view-list-row" data-workflow="Weekly digest</b><span>Echo · Friday 17:00</span><em class="ok">Ready</em></button>
    </div>`
  },
  alerts: {
    title: "Alerts",
    text: "Warnings and failures that may need human attention.",
    body: `<div class="alert-list">
      <button class="alert-row" data-status="warning"><span class="alert-symbol">!</span><div><b>Pulse detected a conversion anomaly</b><small>14.2% mobile drop · 2m ago</small></div><em>Review</em></button>
      <button class="alert-row" data-status="warning"><span class="alert-symbol">!</span><div><b>Nova requested human handoff</b><small>Confidence below 72% · 13m ago</small></div><em>Review</em></button>
      <button class="alert-row" data-status="failed"><span class="alert-symbol">×</span><div><b>Echo draft generation failed</b><small>Provider timeout · 22m ago</small></div><em>Retry</em></button>
    </div>`
  },
  analytics: {
    title: "Analytics",
    text: "Execution volume, success rate and response performance.",
    body: `<div class="view-grid">
      <article class="view-stat"><span>Executions</span><strong>1,284</strong><small>+18.6% today</small></article>
      <article class="view-stat"><span>Success rate</span><strong>98.7%</strong><small>+0.9% this week</small></article>
      <article class="view-stat"><span>Avg. response</span><strong>1.42s</strong><small>12.4% faster</small></article>
    </div><div class="mini-bars"><i style="height:38%"></i><i style="height:52%"></i><i style="height:44%"></i><i style="height:67%"></i><i style="height:58%"></i><i style="height:78%"></i><i style="height:91%"></i></div>`
  },
  settings: {
    title: "Settings",
    text: "Workspace preferences for the monitoring dashboard.",
    body: `<div class="settings-list">
      <label class="setting-row"><span><b>Live activity updates</b><small>Refresh activity automatically</small></span><input type="checkbox" checked></label>
      <label class="setting-row"><span><b>Compact event rows</b><small>Fit more events on screen</small></span><input type="checkbox"></label>
      <label class="setting-row"><span><b>Browser notifications</b><small>Notify about failed executions</small></span><input type="checkbox" checked></label>
    </div><button class="button primary" id="saveSettings">Save settings</button>`
  }
};

function openWorkspaceView(view) {
  const data = viewData[view];
  if (!data) return;
  const quick = document.getElementById("quickView");
  document.getElementById("quickViewTitle").textContent = data.title;
  document.getElementById("quickViewText").textContent = data.text;
  document.getElementById("quickViewBody").innerHTML = data.body;
  quick.hidden = false;
  document.querySelector(".workspace-panel").style.display = "none";
  document.querySelector(".bottom-grid").style.display = "none";
  quick.scrollIntoView({behavior:"smooth", block:"start"});
  if (view === "settings") {
    const save = document.getElementById("saveSettings");
    if (save) save.addEventListener("click", () => showToast("Settings saved successfully"));
  }
  document.querySelectorAll("[data-agent]").forEach(el => el.addEventListener("click", () => {
    const agent = el.dataset.agent;
    document.getElementById("quickView").hidden = true;
    document.querySelector(".workspace-panel").style.display = "";
    document.querySelector(".bottom-grid").style.display = "";
    agentFilter.value = agent; render();
    document.querySelector(".workspace-panel").scrollIntoView({behavior:"smooth",block:"center"});
    showToast(`Showing activity for ${agent}`);
  }));
  document.querySelectorAll("[data-status]").forEach(el => el.addEventListener("click", () => {
    document.getElementById("quickView").hidden = true;
    document.querySelector(".workspace-panel").style.display = "";
    document.querySelector(".bottom-grid").style.display = "";
    statusFilter.value = el.dataset.status; render();
    document.querySelector(".workspace-panel").scrollIntoView({behavior:"smooth",block:"center"});
    showToast(`Showing ${el.dataset.status} events`);
  }));
}

document.querySelectorAll(".nav-item").forEach(btn => btn.addEventListener("click", () => {
  const view = btn.dataset.view;
  document.querySelectorAll(".nav-item").forEach(x => x.classList.remove("active"));
  btn.classList.add("active");
  if (view === "activity") {
    document.getElementById("quickView").hidden = true;
    document.querySelector(".workspace-panel").style.display = "";
    document.querySelector(".bottom-grid").style.display = "";
    statusFilter.value = "all";
    render();
    document.querySelector(".workspace-panel").scrollIntoView({behavior:"smooth",block:"center"});
    showToast("Activity log opened");
  } else {
    openWorkspaceView(view);
  }
}));

document.getElementById("backToActivity").addEventListener("click", () => {
  document.querySelector('.nav-item[data-view="activity"]').click();
});

document.getElementById("themeGlow").addEventListener("click",()=>{document.body.classList.toggle("no-glow");showToast(document.body.classList.contains("no-glow")?"Ambient glow disabled":"Ambient glow enabled")});
document.getElementById("notificationButton").addEventListener("click",()=>showToast("3 activity alerts need your attention"));
document.getElementById("profileButton").addEventListener("click",()=>showToast("Signed in as Sanjay Bhargav"));
document.getElementById("profileButtonTop").addEventListener("click",()=>showToast("Workspace owner · Sanjay Bhargav"));

document.getElementById("viewAgents").addEventListener("click",()=>showToast("Showing your 10-agent workspace"));
document.querySelectorAll(".agent-row").forEach(row=>row.addEventListener("click",()=>{agentFilter.value=row.dataset.agent;render();document.querySelector(".workspace-panel").scrollIntoView({behavior:"smooth",block:"center"});showToast(`Filtered activity for ${row.dataset.agent}`)}));
document.getElementById("rangeSelect").addEventListener("change",e=>showToast(`Execution volume updated to ${e.target.value}`));

document.getElementById("exportButton").addEventListener("click",()=>{
  const headers=["Event ID","Agent","Role","Activity","Trigger","Status","Duration","Time"];
  const rows=activities.map(x=>[x.id,x.agent,x.role,x.action,x.trigger,x.status,x.duration,x.time]);
  const csv=[headers,...rows].map(r=>r.map(v=>`"${String(v).replaceAll('"','""')}"`).join(",")).join("\n");
  const blob=new Blob([csv],{type:"text/csv;charset=utf-8"});
  const url=URL.createObjectURL(blob); const a=document.createElement("a");a.href=url;a.download="agent-activity-log.csv";a.click();URL.revokeObjectURL(url);
  showToast("Activity log exported as CSV");
});


document.querySelectorAll(".pagination button").forEach(btn=>{
  if(!btn.disabled) btn.addEventListener("click",()=>{
    const label=btn.textContent.trim();
    if(label==="›" || label==="2" || label==="3") showToast(`Page ${label==="›" ? "next" : label} selected`);
    else if(label==="‹") showToast("Previous page selected");
    else showToast("Page 1 selected");
  });
});

document.getElementById("newAgentButton").addEventListener("click",()=>{
  modalTitle.textContent="Create a new agent";
  modalContent.innerHTML="";
  const form=document.createElement("div");
  form.className="agent-form";
  form.innerHTML=`
    <label>Agent name<input id="newAgentName" type="text" placeholder="e.g. Orion"></label>
    <label>Agent role<select id="newAgentRole"><option>Research agent</option><option>Support agent</option><option>Analytics agent</option><option>Content agent</option></select></label>
    <div class="modal-actions"><button class="button secondary" id="cancelAgent">Cancel</button><button class="button primary" id="saveAgent">Create agent</button></div>`;
  modalContent.appendChild(form);
  modalBackdrop.hidden=false; document.body.style.overflow="hidden";
  document.getElementById("cancelAgent").onclick=closeModal;
  document.getElementById("saveAgent").onclick=()=>{
    const name=document.getElementById("newAgentName").value.trim();
    if(!name){showToast("Enter an agent name first");return;}
    closeModal(); showToast(`${name} agent created successfully`);
  };
});

document.querySelectorAll(".icon-button").forEach(btn=>{
  btn.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();btn.click();}});
});

function updateClock(){
  const now=new Date();
  document.getElementById("clock").textContent=now.toLocaleTimeString([], {hour:"2-digit",minute:"2-digit",second:"2-digit"});
}
updateClock(); setInterval(updateClock,1000);
render();
