/* AI Agent Dashboard — vanilla JS, no dependencies.
   All data is simulated in-memory so the template works offline. */
(function () {
  "use strict";

  // ---------- State ----------
  const agents = [
    { id: 1, name: "Atlas",   icon: "🧭", role: "Research agent",  status: "running", task: "Summarising 14 competitor pricing pages", done: 128, errors: 3 },
    { id: 2, name: "Scribe",  icon: "✍️", role: "Content agent",   status: "running", task: "Drafting weekly product newsletter",       done: 96,  errors: 1 },
    { id: 3, name: "Sentinel",icon: "🛡️", role: "Monitoring agent",status: "idle",    task: "Waiting for next alert window",            done: 241, errors: 6 },
    { id: 4, name: "Ledger",  icon: "📒", role: "Finance agent",   status: "paused",  task: "Reconciling invoices (paused by user)",    done: 74,  errors: 2 },
    { id: 5, name: "Courier", icon: "📨", role: "Outreach agent",  status: "error",   task: "SMTP timeout while sending batch #42",     done: 58,  errors: 9 },
    { id: 6, name: "Forge",   icon: "🔧", role: "Code agent",      status: "running", task: "Refactoring auth module & running tests",  done: 163, errors: 4 }
  ];

  const approvals = [
    { id: 1, agent: "Courier", title: "Send campaign to 4,200 contacts", desc: "Outreach batch #43 is ready. Review the copy before sending." },
    { id: 2, agent: "Ledger",  title: "Issue refund of ₹18,500",         desc: "Customer #2291 qualifies under the 30-day policy." }
  ];

  const queue = [
    { id: 1, title: "Generate Q3 market report",   prio: "high", agent: "Atlas" },
    { id: 2, title: "Clean up stale support tickets", prio: "med",  agent: "Sentinel" },
    { id: 3, title: "Translate docs to Tamil",     prio: "low",  agent: "Scribe" }
  ];

  const sampleTasks = [
    ["Audit API rate limits", "high"], ["Tag new leads in CRM", "med"], ["Archive old reports", "low"],
    ["Draft release notes", "med"], ["Scan logs for anomalies", "high"]
  ];

  const logs = [];
  const series = { tasks: [12, 15, 14, 18, 22, 21, 26], latency: [3.1, 2.8, 3.4, 2.9, 2.6, 2.7, 2.5] };
  let filter = "all";
  let query = "";

  // ---------- Helpers ----------
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const timeNow = () => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

  let toastTimer;
  function toast(msg) {
    const t = $("toast");
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("show"), 2200);
  }

  function addLog(text, level) {
    logs.unshift({ time: timeNow(), text, level: level || "info" });
    if (logs.length > 40) logs.pop();
    renderLogs();
  }

  // ---------- Renderers ----------
  function sparkPath(data) {
    const min = Math.min(...data), max = Math.max(...data), span = max - min || 1;
    return data.map((v, i) => {
      const x = (i / (data.length - 1)) * 120;
      const y = 30 - ((v - min) / span) * 28;
      return (i ? "L" : "M") + x.toFixed(1) + " " + y.toFixed(1);
    }).join(" ");
  }

  function renderKpis() {
    const active = agents.filter((a) => a.status === "running").length;
    const total = agents.reduce((n, a) => n + a.done, 0);
    const errs = agents.reduce((n, a) => n + a.errors, 0);
    const rate = total ? ((total - errs) / total) * 100 : 100;
    const lat = series.latency[series.latency.length - 1];

    $("kpiActive").textContent = active;
    $("kpiActiveSub").textContent = "of " + agents.length + " agents deployed";
    $("kpiTasks").textContent = total.toLocaleString();
    $("kpiSuccess").textContent = rate.toFixed(1) + "%";
    $("kpiSuccessBar").style.width = rate + "%";
    $("kpiLatency").textContent = lat.toFixed(1) + "s";
    $("sparkTasks").innerHTML = '<path d="' + sparkPath(series.tasks) + '"/>';
    $("sparkLatency").innerHTML = '<path d="' + sparkPath(series.latency) + '"/>';
  }

  function renderAgents() {
    const list = agents.filter((a) =>
      (filter === "all" || a.status === filter) &&
      (a.name + " " + a.role).toLowerCase().includes(query)
    );
    $("agentsEmpty").hidden = list.length > 0;
    $("agentGrid").innerHTML = list.map((a) => {
      let actions = "";
      if (a.status === "running") actions = '<button class="btn ghost small" data-act="pause" data-id="' + a.id + '">Pause</button>';
      else if (a.status === "paused" || a.status === "idle") actions = '<button class="btn small" data-act="run" data-id="' + a.id + '">' + (a.status === "paused" ? "Resume" : "Start") + "</button>";
      else if (a.status === "error") actions = '<button class="btn danger small" data-act="retry" data-id="' + a.id + '">Retry</button>';
      if (a.status !== "idle") actions += '<button class="btn ghost small" data-act="stop" data-id="' + a.id + '">Stop</button>';

      return '<article class="agent">' +
        '<div class="agent-top"><div class="avatar" aria-hidden="true">' + a.icon + "</div>" +
        '<div><div class="agent-name">' + esc(a.name) + '</div><div class="agent-role">' + esc(a.role) + "</div></div>" +
        '<span class="status ' + a.status + '">' + a.status + "</span></div>" +
        '<p class="agent-task">' + esc(a.task) + "</p>" +
        '<div class="agent-meta"><span>✔ ' + a.done + ' done</span><span>⚠ ' + a.errors + ' errors</span></div>' +
        '<div class="agent-actions">' + actions + "</div></article>";
    }).join("");
  }

  function renderApprovals() {
    $("approvalCount").textContent = approvals.length;
    $("approvalsEmpty").hidden = approvals.length > 0;
    $("approvalList").innerHTML = approvals.map((p) =>
      '<li class="approval"><h3>' + esc(p.title) + "</h3>" +
      "<p>" + esc(p.agent) + " · " + esc(p.desc) + "</p>" +
      '<div class="row"><button class="btn ok small" data-appr="yes" data-id="' + p.id + '">Approve</button>' +
      '<button class="btn danger small" data-appr="no" data-id="' + p.id + '">Reject</button></div></li>'
    ).join("");
  }

  function renderQueue() {
    $("queueList").innerHTML = queue.map((q) =>
      '<li class="queue-item"><span class="prio ' + q.prio + '">' + q.prio + "</span>" +
      "<span>" + esc(q.title) + '</span><span class="who">' + esc(q.agent) + "</span></li>"
    ).join("") || '<p class="empty">Queue is empty.</p>';
  }

  function renderLogs() {
    const cls = { ok: "ok", warn: "warn", err: "err", info: "" };
    $("logList").innerHTML = logs.map((l) =>
      '<li class="log"><time>' + l.time + '</time><span class="dot ' + cls[l.level] + '"></span><span>' + esc(l.text) + "</span></li>"
    ).join("");
  }

  function renderAll() { renderKpis(); renderAgents(); renderApprovals(); renderQueue(); }

  // ---------- Interactions ----------
  const byId = (id) => agents.find((a) => a.id === Number(id));

  $("agentGrid").addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-act]");
    if (!btn) return;
    const a = byId(btn.dataset.id);
    switch (btn.dataset.act) {
      case "pause": a.status = "paused"; a.task = "Paused by user"; addLog(a.name + " was paused", "warn"); break;
      case "run":   a.status = "running"; a.task = "Picking up next task from queue"; addLog(a.name + " is now running", "ok"); break;
      case "retry": a.status = "running"; a.task = "Retrying failed task…"; addLog(a.name + " retrying after error", "info"); break;
      case "stop":  a.status = "idle"; a.task = "Stopped. Waiting for tasks."; addLog(a.name + " was stopped", "warn"); break;
    }
    renderAll();
  });

  $("approvalList").addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-appr]");
    if (!btn) return;
    const i = approvals.findIndex((p) => p.id === Number(btn.dataset.id));
    if (i < 0) return;
    const item = approvals.splice(i, 1)[0];
    const yes = btn.dataset.appr === "yes";
    addLog((yes ? "Approved: " : "Rejected: ") + item.title, yes ? "ok" : "warn");
    toast(yes ? "Approved ✔" : "Rejected ✖");
    renderAll();
  });

  $("filterChips").addEventListener("click", (e) => {
    const chip = e.target.closest(".chip");
    if (!chip) return;
    filter = chip.dataset.filter;
    document.querySelectorAll(".chip").forEach((c) => c.classList.toggle("active", c === chip));
    renderAgents();
  });

  $("searchInput").addEventListener("input", (e) => { query = e.target.value.trim().toLowerCase(); renderAgents(); });

  $("addTaskBtn").addEventListener("click", () => {
    const [title, prio] = pick(sampleTasks);
    queue.push({ id: Date.now(), title, prio, agent: pick(agents).name });
    addLog("Task queued: " + title);
    renderQueue();
  });

  $("deployBtn").addEventListener("click", () => {
    const n = agents.length + 1;
    agents.push({ id: Date.now(), name: "Agent-" + n, icon: "🤖", role: "Custom agent", status: "idle", task: "Newly deployed. Awaiting tasks.", done: 0, errors: 0 });
    addLog("Agent-" + n + " deployed", "ok");
    toast("New agent deployed");
    renderAll();
  });

  $("clearLogBtn").addEventListener("click", () => { logs.length = 0; renderLogs(); });

  $("menuBtn").addEventListener("click", () => $("sidebar").classList.toggle("open"));
  document.querySelectorAll(".nav-item").forEach((link) =>
    link.addEventListener("click", () => {
      document.querySelectorAll(".nav-item").forEach((l) => l.classList.toggle("active", l === link));
      $("sidebar").classList.remove("open");
    })
  );

  // Theme (storage wrapped in try/catch in case it is blocked)
  function setTheme(t) {
    document.documentElement.setAttribute("data-theme", t);
    try { localStorage.setItem("agent-dash-theme", t); } catch (_) {}
  }
  try { const saved = localStorage.getItem("agent-dash-theme"); if (saved) setTheme(saved); } catch (_) {}
  $("themeBtn").addEventListener("click", () =>
    setTheme(document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark")
  );

  // ---------- Live simulation ----------
  const events = [
    (a) => { a.done++; a.task = "Completed a task, fetching next…"; addLog(a.name + " completed a task", "ok"); },
    (a) => { a.errors++; a.status = "error"; a.task = "Unexpected response from external API"; addLog(a.name + " hit an error", "err"); },
    (a) => { addLog(a.name + " called tool: web_search", "info"); },
    (a) => { addLog(a.name + " requested more context", "warn"); }
  ];

  setInterval(function () {
    const running = agents.filter((a) => a.status === "running");
    if (running.length) {
      const a = pick(running);
      const roll = Math.random();
      pick(roll < 0.55 ? [events[0]] : roll < 0.65 ? [events[1]] : roll < 0.85 ? [events[2]] : [events[3]])(a);
    }
    series.tasks.push(Math.max(8, series.tasks[series.tasks.length - 1] + Math.round((Math.random() - 0.4) * 6)));
    series.latency.push(Math.max(1.2, +(series.latency[series.latency.length - 1] + (Math.random() - 0.5) * 0.6).toFixed(1)));
    series.tasks.shift(); series.latency.shift();
    renderAll();
  }, 3500);

  // ---------- Init ----------
  addLog("Dashboard connected. 3 agents running.", "ok");
  addLog("Courier needs attention: SMTP timeout", "err");
  renderAll();
})();