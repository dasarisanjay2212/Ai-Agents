const approvals = [
  {id:1, title:"Refund customer order", agent:"Support Agent", desc:"Issue a $720 refund for order #HF-2048. Policy threshold requires human approval.", risk:"high", category:"finance", time:"2 min ago", icon:"↩"},
  {id:2, title:"Send enterprise proposal", agent:"Sales Agent", desc:"Send the prepared enterprise proposal to Acme Corp with a 12% discount.", risk:"high", category:"customer", time:"6 min ago", icon:"✉"},
  {id:3, title:"Update customer record", agent:"CRM Agent", desc:"Merge duplicate contact information after verifying matching identifiers.", risk:"medium", category:"customer", time:"11 min ago", icon:"◇"},
  {id:4, title:"Publish research summary", agent:"Research Agent", desc:"Publish the generated weekly research summary to the internal knowledge base.", risk:"medium", category:"finance", time:"18 min ago", icon:"✦"}
];

const agents = [
  ["Research Agent","Research & summaries","✦","1,248","98.8%"],
  ["Support Agent","Customer operations","◎","843","99.4%"],
  ["Sales Agent","Sales workflows","↗","516","97.9%"],
  ["Finance Agent","Financial controls","◇","329","99.9%"],
  ["CRM Agent","Data operations","▣","712","98.6%"],
  ["Compliance Agent","Risk & compliance","✓","281","99.7%"]
];

const activity = [
  ["Refund request paused","Support Agent","paused","2 min ago"],
  ["Market summary generated","Research Agent","approved","7 min ago"],
  ["Customer reply awaiting review","Sales Agent","review","13 min ago"],
  ["Contact record updated","CRM Agent","approved","21 min ago"],
  ["Policy check completed","Compliance Agent","approved","32 min ago"],
  ["Enterprise proposal prepared","Sales Agent","review","41 min ago"],
  ["Account transfer blocked","Finance Agent","paused","55 min ago"],
  ["Knowledge base article drafted","Research Agent","approved","1 hr ago"]
];

const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];

function showToast(title, text){
  $("#toastTitle").textContent=title; $("#toastText").textContent=text;
  $("#toast").classList.add("show");
  clearTimeout(window.toastTimer);
  window.toastTimer=setTimeout(()=>$("#toast").classList.remove("show"),2800);
}

function go(section){
  $$(".section-view").forEach(x=>x.classList.remove("active"));
  $(`#${section}`).classList.add("active");
  $$(".nav-item").forEach(x=>x.classList.toggle("active",x.dataset.section===section));
  const labels={overview:"Overview",approvals:"Approvals",agents:"Agents",workflows:"Workflows",activity:"Activity",settings:"Settings"};
  $("#pageTitle").textContent=labels[section];
  if(innerWidth<=1000) $("#sidebar").classList.remove("open");
  window.scrollTo({top:0,behavior:"smooth"});
}

$$(".nav-item").forEach(btn=>btn.addEventListener("click",()=>go(btn.dataset.section)));
$$("[data-go]").forEach(btn=>btn.addEventListener("click",()=>go(btn.dataset.go)));
$("#menuBtn").addEventListener("click",()=>$("#sidebar").classList.toggle("open"));

function renderOverview(){
  $("#overviewApprovals").innerHTML=approvals.slice(0,3).map(a=>`
    <div class="approval-mini">
      <div class="action-icon">${a.icon}</div>
      <div><strong>${a.title}</strong><p>${a.agent} · ${a.time}</p></div>
      <span class="risk ${a.risk}">${a.risk}</span>
    </div>`).join("");
}
function renderApprovals(filter="all"){
  const list=filter==="all"?approvals:approvals.filter(a=>a.risk===filter||a.category===filter);
  $("#approvalGrid").innerHTML=list.map(a=>`
    <article class="approval-card glass" data-id="${a.id}">
      <div class="approval-top"><div class="action-icon">${a.icon}</div><span class="risk ${a.risk}">${a.risk.toUpperCase()} RISK</span></div>
      <h3>${a.title}</h3><p class="description">${a.desc}</p>
      <div class="meta"><span>✦ ${a.agent}</span><span>◷ ${a.time}</span></div>
      <div class="approval-actions"><button class="danger-btn" data-reject="${a.id}">Reject</button><button class="approve-btn" data-approve="${a.id}">Approve ✓</button></div>
    </article>`).join("");
  $$("[data-approve]").forEach(b=>b.onclick=()=>openApproval(+b.dataset.approve,true));
  $$("[data-reject]").forEach(b=>b.onclick=()=>openApproval(+b.dataset.reject,false));
}
function renderAgents(){
  $("#agentGrid").innerHTML=agents.map(a=>`
    <article class="agent-card glass"><div class="agent-head"><div class="agent-symbol">${a[2]}</div><div><h3>${a[0]}</h3><p>${a[1]}</p></div><i class="online"></i></div>
    <div class="agent-info"><div><span>ACTIONS</span><strong>${a[3]}</strong></div><div><span>SUCCESS RATE</span><strong>${a[4]}</strong></div></div>
    <div class="agent-footer"><span>● Running normally</span><button class="manage-btn" data-agent="${a[0]}">Manage →</button></div></article>`).join("");
  $$("[data-agent]").forEach(b=>b.onclick=()=>showToast("Agent selected",`${b.dataset.agent} is healthy and running.`));
}
function renderActivity(){
  $("#activityTable").innerHTML=activity.map(x=>`
    <div class="table-row"><div><strong>${x[0]}</strong><small>HumanLoop workflow event</small></div><div>${x[1]}</div><div><span class="status ${x[2]}">${x[2]}</span></div><div>${x[3]}</div></div>`).join("");
}

let pendingId=null,pendingApprove=true;
function openApproval(id, approve){
  const a=approvals.find(x=>x.id===id); pendingId=id; pendingApprove=approve;
  $("#modalTitle").textContent=approve?`Approve "${a.title}"?`:`Reject "${a.title}"?`;
  $("#modalText").textContent=approve?"This will allow the agent to continue with the proposed action.":"This will stop the proposed action and mark it as rejected.";
  $("#modalConfirm").textContent=approve?"Approve ✓":"Reject";
  $("#modalConfirm").className=approve?"primary-btn":"danger-btn";
  $("#modalBackdrop").classList.add("show");
}
function closeModal(){$("#modalBackdrop").classList.remove("show")}
$("#modalClose").onclick=closeModal; $("#modalCancel").onclick=closeModal;
$("#modalConfirm").onclick=()=>{
  const a=approvals.find(x=>x.id===pendingId);
  showToast(pendingApprove?"Approved":"Rejected",`${a.title} has been ${pendingApprove?"approved":"rejected"}.`);
  const i=approvals.findIndex(x=>x.id===pendingId); if(i>-1) approvals.splice(i,1);
  closeModal(); renderOverview(); renderApprovals(); renderActivity();
};

$$(".filter").forEach(f=>f.addEventListener("click",()=>{
  $$(".filter").forEach(x=>x.classList.remove("active"));f.classList.add("active");renderApprovals(f.dataset.filter);
}));
$("#approveAllBtn").onclick=()=>{
  if(!approvals.length){showToast("Queue clear","There are no pending approvals.");return}
  approvals.splice(0,approvals.length);renderOverview();renderApprovals();showToast("All safe actions approved","The approval queue is now clear.");
};
$("#newAgentBtn").onclick=()=>showToast("Create agent","Agent creation is ready for configuration.");
$("#newWorkflowBtn").onclick=()=>showToast("New workflow","Workflow builder opened in template mode.");
$("#saveSettingsBtn").onclick=()=>showToast("Settings saved","Your workspace preferences were updated.");
$("#exportBtn").onclick=()=>showToast("Export ready","The activity log has been prepared for download.");
$("#notificationBtn").onclick=()=>showToast("Notifications","2 approval requests need your attention.");
$("#logoutBtn").onclick=()=>showToast("Demo action","Sign-out is disabled in this presentation prototype.");
$("#profileBtn").onclick=()=>go("settings");

$("#searchBtn").onclick=()=>{
  $("#searchPanel").classList.toggle("show");
  if($("#searchPanel").classList.contains("show")) $("#globalSearch").focus();
};
$("#globalSearch").addEventListener("keydown",e=>{
  if(e.key==="Enter"){
    const q=e.target.value.trim().toLowerCase();
    if(!q){showToast("Search","Type something to search.");return}
    const hit=approvals.find(a=>(a.title+" "+a.agent+" "+a.desc).toLowerCase().includes(q));
    if(hit){go("approvals");showToast("Match found",`Showing ${hit.title}.`)}else showToast("No matches",`Nothing matched "${e.target.value}".`);
  }
});

document.addEventListener("keydown",e=>{if(e.key==="Escape")closeModal()});
renderOverview();renderApprovals();renderAgents();renderActivity();
