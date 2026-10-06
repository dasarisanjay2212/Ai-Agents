(() => {
"use strict";

const executions = [
  {name:"Research competitor pricing",id:"run_8f31c2",agent:"Atlas Researcher",initials:"AR",avatar:"",status:"success",trigger:"Schedule",duration:"38.4s",tokens:"12.8k",age:2,task:"Collect and summarize competitor pricing data.",steps:["Started scheduled workflow","Queried 4 web sources","Normalized pricing data","Generated comparison summary"]},
  {name:"Resolve support ticket #4821",id:"run_8f2aa1",agent:"Nova Support",initials:"NS",avatar:"blue",status:"success",trigger:"Webhook",duration:"21.7s",tokens:"8.4k",age:7,task:"Analyze customer issue and prepare a resolution.",steps:["Received support webhook","Retrieved customer context","Analyzed issue","Drafted response"]},
  {name:"Weekly revenue insights",id:"run_8f190e",agent:"Orion Analyst",initials:"OA",avatar:"green",status:"running",trigger:"Schedule",duration:"1m 12s",tokens:"31.2k",age:11,task:"Analyze weekly revenue and identify anomalies.",steps:["Loaded analytics dataset","Running anomaly detection","Building revenue summary"]},
  {name:"Draft product announcement",id:"run_8e91b7",agent:"Pulse Writer",initials:"PW",avatar:"pink",status:"success",trigger:"Manual",duration:"44.1s",tokens:"16.7k",age:24,task:"Create a concise product announcement from notes.",steps:["Loaded product notes","Created outline","Generated first draft","Applied brand tone"]},
  {name:"Plan sprint backlog",id:"run_8e72aa",agent:"Sage Planner",initials:"SP",avatar:"gold",status:"failed",trigger:"Manual",duration:"18.2s",tokens:"6.1k",age:38,task:"Prioritize backlog items against current sprint goals.",steps:["Loaded backlog","Scored priorities","Failed while syncing Jira"]},
  {name:"Research AI market trends",id:"run_8e51d0",agent:"Atlas Researcher",initials:"AR",avatar:"",status:"success",trigger:"Schedule",duration:"52.9s",tokens:"22.3k",age:60,task:"Summarize recent AI market trends.",steps:["Queried market sources","Deduplicated findings","Ranked trends","Generated report"]},
  {name:"Customer churn analysis",id:"run_8d93ff",agent:"Orion Analyst",initials:"OA",avatar:"green",status:"success",trigger:"API",duration:"1m 04s",tokens:"27.9k",age:120,task:"Find signals correlated with customer churn.",steps:["Loaded customer dataset","Calculated cohort metrics","Found 7 signals","Generated insight card"]},
  {name:"Summarize team meeting",id:"run_8d78ac",agent:"Pulse Writer",initials:"PW",avatar:"pink",status:"success",trigger:"Manual",duration:"29.5s",tokens:"9.8k",age:180,task:"Turn meeting transcript into action items.",steps:["Parsed transcript","Detected speakers","Extracted decisions","Created action list"]},
  {name:"Refresh customer segments",id:"run_8c42bd",agent:"Orion Analyst",initials:"OA",avatar:"green",status:"success",trigger:"API",duration:"34.6s",tokens:"14.1k",age:240,task:"Refresh customer segmentation model.",steps:["Loaded features","Scored customers","Updated segments"]},
  {name:"Generate weekly digest",id:"run_8c11aa",agent:"Pulse Writer",initials:"PW",avatar:"pink",status:"success",trigger:"Schedule",duration:"26.2s",tokens:"7.7k",age:300,task:"Create the weekly internal product digest.",steps:["Collected updates","Summarized changes","Published digest"]},
  {name:"Sync CRM contacts",id:"run_8b92fe",agent:"Nova Support",initials:"NS",avatar:"blue",status:"failed",trigger:"Webhook",duration:"13.8s",tokens:"4.2k",age:360,task:"Synchronize new contacts with CRM.",steps:["Received webhook","Validated records","CRM request failed"]},
  {name:"Security anomaly scan",id:"run_8b72de",agent:"Atlas Researcher",initials:"AR",avatar:"",status:"running",trigger:"Schedule",duration:"2m 08s",tokens:"28.6k",age:420,task:"Scan recent agent activity for unusual patterns.",steps:["Loaded activity log","Checking anomaly rules","Building risk summary"]},
  {name:"Prepare Q4 campaign brief",id:"run_8a65ce",agent:"Pulse Writer",initials:"PW",avatar:"pink",status:"success",trigger:"Manual",duration:"41.6s",tokens:"11.4k",age:900,task:"Turn campaign notes into a structured brief.",steps:["Loaded campaign notes","Built content structure","Generated brief"]},
  {name:"Detect billing anomalies",id:"run_8a22bd",agent:"Orion Analyst",initials:"OA",avatar:"green",status:"failed",trigger:"API",duration:"49.8s",tokens:"18.2k",age:1440,task:"Identify unusual billing patterns in the latest dataset.",steps:["Loaded billing data","Calculated anomaly scores","Threshold check failed"]},
  {name:"Research competitor launches",id:"run_89f3aa",agent:"Atlas Researcher",initials:"AR",avatar:"",status:"success",trigger:"Schedule",duration:"1m 18s",tokens:"33.7k",age:2880,task:"Compare competitor product launches and positioning.",steps:["Collected sources","Extracted launch details","Compared positioning","Published summary"]}
];

const $ = id => document.getElementById(id);
const qs = (sel, root=document) => Array.from(root.querySelectorAll(sel));
const state = { page:"history", currentPage:1, pageSize:8, cardMode:false, dateRange:"30d" };

const dateRanges = {
  "30d": {label:"Last 30 days", max:43200},
  "7d": {label:"Last 7 days", max:10080},
  "today": {label:"Today", max:1440},
  "all": {label:"All time", max:Infinity}
};
const dateOrder=["30d","7d","today","all"];

function escapeHTML(value){
  return String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
function statusHTML(s){ return `<span class="status ${escapeHTML(s)}">${escapeHTML(s[0].toUpperCase()+s.slice(1))}</span>`; }
function filteredData(){
  const q = $("searchInput").value.trim().toLowerCase();
  const status = $("statusFilter").value;
  const agent = $("agentFilter").value;
  const maxAge = dateRanges[state.dateRange].max;
  return executions.filter(x => {
    const haystack = [x.name,x.id,x.agent,x.status,x.trigger,x.task,...x.steps].join(" ").toLowerCase();
    return (!q || haystack.includes(q))
      && (status==="all" || x.status===status)
      && (agent==="all" || x.agent===agent)
      && x.age <= maxAge;
  });
}
function startedLabel(age){
  if(age < 1) return "Just now";
  if(age < 60) return `${age} min ago`;
  if(age < 1440) return `${Math.floor(age/60)} hr ago`;
  return `${Math.floor(age/1440)} day${Math.floor(age/1440)===1?"":"s"} ago`;
}
function row(x){
  return `<tr>
    <td><button class="execution clickable" data-open="${x.id}" aria-label="Open ${escapeHTML(x.name)}">
      <span class="run-icon">${x.status==="running"?"◌":"✦"}</span>
      <span><span class="run-name">${escapeHTML(x.name)}</span><span class="run-id">${escapeHTML(x.id)}</span></span>
    </button></td>
    <td><div class="agent"><span class="agent-avatar ${escapeHTML(x.avatar)}">${escapeHTML(x.initials)}</span>${escapeHTML(x.agent)}</div></td>
    <td>${statusHTML(x.status)}</td><td>${escapeHTML(x.trigger)}</td><td>${escapeHTML(x.duration)}</td><td>${escapeHTML(x.tokens)}</td><td>${startedLabel(x.age)}</td>
    <td><button class="row-action" data-open="${x.id}" aria-label="Open execution details">•••</button></td>
  </tr>`;
}
function card(x){
  return `<article class="exec-card" data-open="${x.id}" tabindex="0" role="button" aria-label="Open ${escapeHTML(x.name)}">
    <header><span>${statusHTML(x.status)}</span><small>${startedLabel(x.age)}</small></header>
    <h3>${escapeHTML(x.name)}</h3><p>${escapeHTML(x.task)}</p>
    <div class="exec-meta"><span>${escapeHTML(x.agent)}</span><span>•</span><span>${escapeHTML(x.duration)}</span><span>•</span><span>${escapeHTML(x.tokens)}</span></div>
  </article>`;
}
function render(){
  const all=filteredData();
  const totalPages=Math.max(1,Math.ceil(all.length/state.pageSize));
  state.currentPage=Math.min(state.currentPage,totalPages);
  const start=(state.currentPage-1)*state.pageSize;
  const slice=all.slice(start,start+state.pageSize);

  $("executionBody").innerHTML=slice.map(row).join("");
  $("cardWrap").innerHTML=slice.map(card).join("");
  $("tableWrap").classList.toggle("hidden",state.cardMode);
  $("cardWrap").classList.toggle("hidden",!state.cardMode);
  $("emptyState").classList.toggle("hidden",all.length!==0);
  $("resultCount").textContent=all.length;
  $("pageText").textContent=all.length ? `Showing ${start+1}–${Math.min(start+state.pageSize,all.length)} of ${all.length}` : "Showing 0";
  $("prevPage").disabled=state.currentPage<=1;
  $("nextPage").disabled=state.currentPage>=totalPages;

  $("pageNumbers").innerHTML=Array.from({length:Math.min(totalPages,5)},(_,i)=>{
    const n=i+1;
    return `<button class="page-number ${n===state.currentPage?"active":""}" data-page="${n}" aria-label="Page ${n}">${n}</button>`;
  }).join("");
  $("dateLabel").textContent=dateRanges[state.dateRange].label;
  $("tableViewBtn").classList.toggle("active",!state.cardMode);
  $("cardViewBtn").classList.toggle("active",state.cardMode);
  $("viewRoot").dataset.results=all.length;
}
function showPage(name){
  state.page=name;
  qs(".view").forEach(v=>v.classList.toggle("hidden",v.dataset.page!==name));
  qs(".nav-link[data-view]").forEach(b=>b.classList.toggle("active",b.dataset.view===name));
  const labels={overview:"Overview",agents:"Agents",history:"Execution History",workflows:"Workflows",knowledge:"Knowledge",settings:"Settings",help:"Help Center"};
  $("crumbCurrent").textContent=labels[name]||name;
  closeNotifications();
  if(name==="agents") buildAgents();
  if(name==="history") render();
  closeMobileNav();
}
function buildAgents(){
  const agents=[
    ["Atlas Researcher","AR","Online","12.4k runs"],
    ["Nova Support","NS","Online","4.2k runs"],
    ["Orion Analyst","OA","Running","1.9k runs"],
    ["Pulse Writer","PW","Online","2.8k runs"],
    ["Sage Planner","SP","Idle","1.1k runs"]
  ];
  $("agentCards").innerHTML=agents.map(a=>`<article class="glass resource"><b>${a[0]}</b><span>${a[3]}</span><strong>${a[2]}</strong></article>`).join("");
}

function openDrawer(x){
  if(!x)return;
  $("drawerContent").innerHTML=`
    <div class="drawer-kicker">EXECUTION DETAILS</div>
    <div class="drawer-title">${escapeHTML(x.name)}</div>
    <div class="drawer-id">${escapeHTML(x.id)}</div>
    <div class="drawer-status">${statusHTML(x.status)}</div>
    <section class="drawer-section"><h4>Run overview</h4><div class="detail-grid">
      <div class="detail-item"><small>Agent</small><strong>${escapeHTML(x.agent)}</strong></div>
      <div class="detail-item"><small>Trigger</small><strong>${escapeHTML(x.trigger)}</strong></div>
      <div class="detail-item"><small>Duration</small><strong>${escapeHTML(x.duration)}</strong></div>
      <div class="detail-item"><small>Tokens</small><strong>${escapeHTML(x.tokens)}</strong></div>
    </div></section>
    <section class="drawer-section"><h4>Execution timeline</h4><div class="trace">${x.steps.map((s,i)=>`
      <div class="step"><time>00:${String(i*9).padStart(2,"0")}</time><strong>${escapeHTML(s)}</strong>
      <p>${i===x.steps.length-1?(x.status==="failed"?"Execution stopped at this step.":"Step completed successfully."):"Context passed to the next step."}</p></div>`).join("")}</div></section>
    <section class="drawer-section"><h4>Agent output</h4><div class="code-box">task: ${escapeHTML(x.task)}
status: "${escapeHTML(x.status)}"
execution_id: "${escapeHTML(x.id)}"</div></section>`;
  $("drawer").classList.add("open");
  $("backdrop").classList.add("open");
  $("drawer").setAttribute("aria-hidden","false");
}
function closeDrawer(){
  $("drawer").classList.remove("open");
  $("backdrop").classList.remove("open");
  $("drawer").setAttribute("aria-hidden","true");
}
function closeModal(){ $("newRunModal").classList.add("hidden"); }
function closeNotifications(){ $("notificationPanel").classList.add("hidden"); }
function openNotifications(){ $("notificationPanel").classList.remove("hidden"); }
function closeMobileNav(){
  document.body.classList.remove("mobile-nav-open");
  $("mobileBackdrop")?.classList.remove("open");
}
function toast(message){
  const el=$("toast");
  el.textContent=message;
  el.classList.add("show");
  clearTimeout(window.__toastTimer);
  window.__toastTimer=setTimeout(()=>el.classList.remove("show"),2200);
}
function focusSearch(){
  showPage("history");
  $("searchInput").focus();
  $("searchInput").select();
}
function resetFilters(){
  $("searchInput").value="";
  $("statusFilter").value="all";
  $("agentFilter").value="all";
  state.dateRange="30d";
  state.currentPage=1;
  render();
  toast("Filters cleared");
}
function exportCSV(){
  const rows=[["Execution","Run ID","Agent","Status","Trigger","Duration","Tokens","Started"]];
  filteredData().forEach(x=>rows.push([x.name,x.id,x.agent,x.status,x.trigger,x.duration,x.tokens,startedLabel(x.age)]));
  const csv=rows.map(r=>r.map(v=>`"${String(v).replaceAll('"','""')}"`).join(",")).join("\n");
  const blob=new Blob(["\uFEFF"+csv],{type:"text/csv;charset=utf-8"});
  const url=URL.createObjectURL(blob);
  const a=document.createElement("a");
  a.href=url;a.download="agent-execution-history.csv";
  document.body.appendChild(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
  toast(`${filteredData().length} execution${filteredData().length===1?"":"s"} exported`);
}
function startRun(){
  const agent=$("runAgent").value;
  const task=$("runTask").value.trim()||"New agent task";
  const initials=agent.split(/\s+/).map(x=>x[0]).join("").slice(0,2);
  const avatar={"Nova Support":"blue","Orion Analyst":"green","Pulse Writer":"pink","Sage Planner":"gold","Atlas Researcher":""}[agent]||"";
  executions.unshift({
    name:task.length>48?task.slice(0,48)+"…":task,
    id:"run_"+Math.random().toString(16).slice(2,8),
    agent,initials,avatar,status:"running",trigger:"Manual",duration:"Running",tokens:"—",age:0,
    task,steps:["Execution created","Agent received task","Waiting for first result"]
  });
  $("runTask").value="";
  closeModal();showPage("history");state.currentPage=1;render();
  toast("New execution started");
}
function toggleCompact(enabled){document.body.classList.toggle("compact",enabled);}

document.addEventListener("click",e=>{
  const nav=e.target.closest("[data-view]");
  if(nav){e.preventDefault();showPage(nav.dataset.view);return;}

  const open=e.target.closest("[data-open]");
  if(open){e.preventDefault();openDrawer(executions.find(x=>x.id===open.dataset.open));return;}

  const page=e.target.closest(".page-number");
  if(page){state.currentPage=Number(page.dataset.page);render();return;}

  if(e.target.closest("#focusSearch")){focusSearch();return;}
  if(e.target.closest("#notificationBtn")){$("notificationPanel").classList.toggle("hidden");return;}
  if(e.target.closest("#closeNotifications")){closeNotifications();return;}
  if(e.target.closest("#newRunBtn")){$("newRunModal").classList.remove("hidden");return;}
  if(e.target.closest("#closeModal")||e.target.closest("#cancelRun")){closeModal();return;}
  if(e.target.closest("#startRun")){startRun();return;}
  if(e.target.closest("#closeDrawer")||e.target=== $("backdrop")){closeDrawer();return;}
  if(e.target.closest("#exportBtn")){exportCSV();return;}
  if(e.target.closest("#clearFilters")){resetFilters();return;}
  if(e.target.closest("#prevPage")){if(state.currentPage>1){state.currentPage--;render();}return;}
  if(e.target.closest("#nextPage")){const max=Math.max(1,Math.ceil(filteredData().length/state.pageSize));if(state.currentPage<max){state.currentPage++;render();}return;}
  if(e.target.closest("#tableViewBtn")){state.cardMode=false;render();return;}
  if(e.target.closest("#cardViewBtn")){state.cardMode=true;render();return;}
  if(e.target.closest("#dateBtn")){
    const i=dateOrder.indexOf(state.dateRange);
    state.dateRange=dateOrder[(i+1)%dateOrder.length];state.currentPage=1;render();
    toast(`Date range: ${dateRanges[state.dateRange].label}`);return;
  }
  if(e.target.closest("#upgradeBtn")){toast("Agent Pro plan selected");return;}
  if(e.target.closest("#profileBtn")){showPage("settings");return;}
  const faq=e.target.closest(".faq button");
  if(faq){toast("Help article opened");return;}
  if(e.target.closest("#mobileMenuBtn")){
    document.body.classList.toggle("mobile-nav-open");
    $("mobileBackdrop")?.classList.toggle("open");
    return;
  }
  if(e.target.closest("#mobileBackdrop")){closeMobileNav();return;}
});

document.addEventListener("keydown",e=>{
  if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==="k"){e.preventDefault();focusSearch();}
  if(e.key==="Escape"){closeDrawer();closeModal();closeNotifications();closeMobileNav();}
  const card=e.target.closest?.(".exec-card");
  if(card && (e.key==="Enter"||e.key===" ")){e.preventDefault();openDrawer(executions.find(x=>x.id===card.dataset.open));}
});

$("searchInput").addEventListener("input",()=>{state.currentPage=1;render();});
$("statusFilter").addEventListener("change",()=>{state.currentPage=1;render();});
$("agentFilter").addEventListener("change",()=>{state.currentPage=1;render();});
$("liveToggle").addEventListener("change",e=>toast(e.target.checked?"Live updates enabled":"Live updates paused"));
$("notifyToggle").addEventListener("change",e=>toast(e.target.checked?"Notifications enabled":"Notifications disabled"));
$("compactToggle").addEventListener("change",e=>toggleCompact(e.target.checked));
$("runTask").addEventListener("keydown",e=>{if((e.ctrlKey||e.metaKey)&&e.key==="Enter")startRun();});

window.addEventListener("load",()=>{
  showPage("history");
  render();
});
render();
})();