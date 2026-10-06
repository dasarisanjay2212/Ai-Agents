const state = {
  filter: "all",
  search: "",
  priority: "all",
  selectedId: null,
  tasks: [
    { id: 1, name: "Analyze Q3 customer feedback", description: "Extract sentiment, recurring themes, and actionable product insights from customer responses.", agent: "Research Agent", priority: "high", status: "running", progress: 72, created: "2 min ago", eta: "1m 14s" },
    { id: 2, name: "Generate weekly security report", description: "Compile the latest security events and summarize high-risk findings for the operations team.", agent: "Security Agent", priority: "high", status: "queued", progress: 0, created: "5 min ago", eta: "Waiting" },
    { id: 3, name: "Clean sales dataset", description: "Validate missing values, normalize fields, and prepare the dataset for downstream analytics.", agent: "Data Analyst", priority: "medium", status: "running", progress: 41, created: "8 min ago", eta: "3m 48s" },
    { id: 4, name: "Draft product launch summary", description: "Create a concise launch summary from the supplied product notes and campaign metrics.", agent: "Content Agent", priority: "medium", status: "completed", progress: 100, created: "18 min ago", eta: "Done" },
    { id: 5, name: "Monitor competitor pricing", description: "Check approved public sources and identify meaningful changes in competitor pricing.", agent: "Browser Agent", priority: "low", status: "queued", progress: 0, created: "23 min ago", eta: "Waiting" },
    { id: 6, name: "Summarize research documents", description: "Read the provided research documents and produce a structured executive summary.", agent: "Research Agent", priority: "low", status: "completed", progress: 100, created: "31 min ago", eta: "Done" }
  ],
  activity: [
    { icon: "✓", title: "Task completed", text: "Draft product launch summary was completed by Content Agent.", time: "18 min ago" },
    { icon: "▶", title: "Task started", text: "Clean sales dataset is now running on Data Analyst.", time: "8 min ago" },
    { icon: "＋", title: "Task queued", text: "Monitor competitor pricing was added to the queue.", time: "23 min ago" },
    { icon: "✓", title: "Task completed", text: "Summarize research documents was completed.", time: "31 min ago" }
  ]
};

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, ch => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#039;" }[ch]));
}

function statusLabel(status) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function filteredTasks() {
  return state.tasks.filter(task => {
    const filterMatch = state.filter === "all" || task.status === state.filter;
    const priorityMatch = state.priority === "all" || task.priority === state.priority;
    const query = state.search.toLowerCase();
    const searchMatch = !query || `${task.name} ${task.description} ${task.agent}`.toLowerCase().includes(query);
    return filterMatch && priorityMatch && searchMatch;
  });
}

function updateStats() {
  const queued = state.tasks.filter(t => t.status === "queued").length;
  const running = state.tasks.filter(t => t.status === "running").length;
  const completed = state.tasks.filter(t => t.status === "completed").length;
  const attention = state.tasks.filter(t => t.priority === "high" && t.status !== "completed").length;

  $("#queuedCount").textContent = queued;
  $("#runningCount").textContent = running;
  $("#completedCount").textContent = completed;
  $("#attentionCount").textContent = attention;
  $("#queuedBadge").textContent = queued;
  $("#runningBadge").textContent = running;
  $("#completedBadge").textContent = completed;
  $("#allBadge").textContent = state.tasks.length;

  const rate = state.tasks.length ? Math.round((completed / state.tasks.length) * 100) : 0;
  $("#successRate").textContent = `${rate}%`;
  $("#successProgress").style.width = `${rate}%`;
}

function renderTasks() {
  const list = $("#taskList");
  const tasks = filteredTasks();

  if (!tasks.length) {
    list.innerHTML = `<div class="empty-list">No tasks match your current filters.</div>`;
    return;
  }

  list.innerHTML = tasks.map(task => `
    <article class="task-card ${state.selectedId === task.id ? "selected" : ""}" data-task-id="${task.id}">
      <div class="task-main">
        <div class="task-icon">${task.status === "completed" ? "✓" : task.status === "running" ? "▶" : "◌"}</div>
        <div class="task-content">
          <div class="task-title-row">
            <div class="task-title">${escapeHtml(task.name)}</div>
            <span class="task-time">${escapeHtml(task.created)}</span>
          </div>
          <p class="task-desc">${escapeHtml(task.description)}</p>
          <div class="task-meta">
            <span class="badge ${task.priority}">${task.priority}</span>
            <span class="badge status-badge ${task.status}">${statusLabel(task.status)}</span>
            <span class="task-time">Agent: ${escapeHtml(task.agent)}</span>
          </div>
        </div>
      </div>
      <div class="task-actions">
        <button data-action="view" data-id="${task.id}">View details</button>
        ${task.status === "queued" ? `<button data-action="start" data-id="${task.id}">Start</button>` : ""}
        ${task.status === "running" ? `<button data-action="pause" data-id="${task.id}">Pause</button>` : ""}
        ${task.status !== "completed" ? `<button data-action="complete" data-id="${task.id}">Mark complete</button>` : ""}
      </div>
    </article>
  `).join("");

  $$(".task-card").forEach(card => {
    card.addEventListener("click", event => {
      if (event.target.closest("button")) return;
      selectTask(Number(card.dataset.taskId));
    });
  });
  $$("[data-action]").forEach(button => {
    button.addEventListener("click", event => {
      event.stopPropagation();
      handleTaskAction(button.dataset.action, Number(button.dataset.id));
    });
  });
}

function selectTask(id) {
  state.selectedId = id;
  renderTasks();
  renderDetail();
}

function renderDetail() {
  const task = state.tasks.find(t => t.id === state.selectedId);
  const panel = $("#detailPanel");
  if (!task) {
    panel.innerHTML = `<div class="empty-detail"><div class="empty-icon">✦</div><h3>Select a task</h3><p>Choose a task from the queue to inspect its execution details.</p></div>`;
    return;
  }

  panel.innerHTML = `
    <div class="detail-inner">
      <div class="detail-head">
        <div><p class="eyebrow">TASK DETAILS</p><h3>${escapeHtml(task.name)}</h3></div>
        <span class="badge status-badge ${task.status}">${statusLabel(task.status)}</span>
      </div>
      <p class="detail-desc">${escapeHtml(task.description)}</p>
      <div class="detail-section"><div class="detail-label">Assigned agent</div><div class="detail-value">${escapeHtml(task.agent)}</div></div>
      <div class="detail-section"><div class="detail-label">Priority</div><span class="badge ${task.priority}">${task.priority}</span></div>
      <div class="detail-section">
        <div class="detail-label">Execution progress <strong style="float:right;color:#9fa6c0">${task.progress}%</strong></div>
        <div class="progress"><i style="width:${task.progress}%"></i></div>
      </div>
      <div class="detail-section"><div class="detail-label">Estimated time</div><div class="detail-value">${escapeHtml(task.eta)}</div></div>
      <div class="detail-section"><div class="detail-label">Created</div><div class="detail-value">${escapeHtml(task.created)}</div></div>
      <div class="detail-buttons">
        ${task.status === "queued" ? `<button class="primary-btn" data-detail-action="start">Start task</button>` : ""}
        ${task.status === "running" ? `<button class="secondary-btn" data-detail-action="pause">Pause</button>` : ""}
        ${task.status !== "completed" ? `<button class="secondary-btn" data-detail-action="complete">Complete</button>` : ""}
        <button class="secondary-btn" data-detail-action="delete">Delete</button>
      </div>
    </div>
  `;

  $$("[data-detail-action]").forEach(button => {
    button.addEventListener("click", () => handleTaskAction(button.dataset.detailAction, task.id));
  });
}

function handleTaskAction(action, id) {
  const task = state.tasks.find(t => t.id === id);
  if (!task) return;

  if (action === "start") {
    task.status = "running";
    task.progress = Math.max(task.progress, 8);
    task.eta = "Calculating...";
    addActivity("▶", "Task started", `${task.name} is now running on ${task.agent}.`);
    showToast("Task started successfully.", "success");
  } else if (action === "pause") {
    task.status = "queued";
    task.eta = "Paused";
    addActivity("Ⅱ", "Task paused", `${task.name} was returned to the queue.`);
    showToast("Task paused.");
  } else if (action === "complete") {
    task.status = "completed";
    task.progress = 100;
    task.eta = "Done";
    addActivity("✓", "Task completed", `${task.name} was marked as completed.`);
    showToast("Task completed.", "success");
  } else if (action === "delete") {
    state.tasks = state.tasks.filter(t => t.id !== id);
    if (state.selectedId === id) state.selectedId = null;
    addActivity("×", "Task deleted", `${task.name} was removed from the queue.`);
    showToast("Task deleted.");
  } else {
    selectTask(id);
    return;
  }

  updateStats();
  renderTasks();
  renderDetail();
  renderActivity();
}

function addActivity(icon, title, text) {
  state.activity.unshift({ icon, title, text, time: "Just now" });
  state.activity = state.activity.slice(0, 12);
}

function renderActivity() {
  $("#activityList").innerHTML = state.activity.length
    ? state.activity.map(item => `
      <div class="activity-item">
        <div class="activity-icon">${escapeHtml(item.icon)}</div>
        <div><strong>${escapeHtml(item.title)}</strong><p>${escapeHtml(item.text)}</p></div>
        <span class="activity-time">${escapeHtml(item.time)}</span>
      </div>
    `).join("")
    : `<div class="empty-list">No activity yet.</div>`;
}

function renderAgents() {
  const agents = [
    ["Research Agent", "Research & synthesis", "Active", "12 tasks", "94%"],
    ["Data Analyst", "Data cleaning & analysis", "Active", "9 tasks", "88%"],
    ["Security Agent", "Security monitoring", "Idle", "7 tasks", "96%"],
    ["Content Agent", "Writing & summarization", "Active", "15 tasks", "91%"],
    ["Browser Agent", "Web automation", "Active", "6 tasks", "83%"],
    ["Vision Agent", "Image understanding", "Idle", "4 tasks", "89%"]
  ];
  $("#agentsGrid").innerHTML = agents.map((a, i) => `
    <article class="agent-card glass-panel">
      <div class="agent-top">
        <div class="agent-avatar">${["⌁","◒","◇","✎","◉","◈"][i]}</div>
        <div><h4>${a[0]}</h4><p>${a[1]}</p></div>
        <span class="agent-state" style="color:${a[2] === "Active" ? "var(--green)" : "var(--muted)"}">${a[2]}</span>
      </div>
      <div class="agent-stat"><span>Tasks today</span><strong>${a[3]}</strong></div>
      <div class="agent-stat"><span>Success rate</span><strong>${a[4]}</strong></div>
    </article>
  `).join("");
}

function switchView(view) {
  const titles = {
    queue: ["Agent Task Queue", "Monitor, prioritize, and control autonomous agent work."],
    agents: ["AI Agents", "Monitor the autonomous workforce and agent performance."],
    activity: ["Activity Log", "Review the latest task and agent events."],
    analytics: ["Analytics Overview", "Understand task throughput and system performance."],
    settings: ["Settings", "Configure workspace behavior and execution preferences."]
  };
  $$(".view").forEach(section => section.classList.add("hidden"));
  $(`#${view}View`).classList.remove("hidden");
  $("#pageTitle").textContent = titles[view][0];
  $("#pageSubtitle").textContent = titles[view][1];
  $$(".nav-item").forEach(btn => btn.classList.toggle("active", btn.dataset.view === view));
  if (view === "activity") renderActivity();
}

function openModal() {
  $("#taskModal").classList.remove("hidden");
  $("#taskName").focus();
}
function closeModal() {
  $("#taskModal").classList.add("hidden");
  $("#taskForm").reset();
}

function showToast(message, type = "") {
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.textContent = message;
  $("#toastContainer").appendChild(toast);
  setTimeout(() => toast.remove(), 2600);
}

$("#newTaskBtn").addEventListener("click", openModal);
$("#closeModalBtn").addEventListener("click", closeModal);
$("#cancelModalBtn").addEventListener("click", closeModal);
$("#taskModal").addEventListener("click", e => { if (e.target === $("#taskModal")) closeModal(); });

$("#taskForm").addEventListener("submit", e => {
  e.preventDefault();
  const name = $("#taskName").value.trim();
  if (!name) return;
  const task = {
    id: Date.now(),
    name,
    description: $("#taskDescription").value.trim() || "No description provided.",
    agent: $("#taskAgent").value,
    priority: $("#taskPriority").value,
    status: "queued",
    progress: 0,
    created: "Just now",
    eta: "Waiting"
  };
  state.tasks.unshift(task);
  state.selectedId = task.id;
  addActivity("＋", "Task queued", `${name} was added to the task queue.`);
  closeModal();
  updateStats();
  renderTasks();
  renderDetail();
  renderActivity();
  showToast("New task added to the queue.", "success");
});

$$(".tab").forEach(tab => tab.addEventListener("click", () => {
  $$(".tab").forEach(t => t.classList.remove("active"));
  tab.classList.add("active");
  state.filter = tab.dataset.filter;
  renderTasks();
}));

$("#searchInput").addEventListener("input", e => {
  state.search = e.target.value;
  renderTasks();
});
$("#priorityFilter").addEventListener("change", e => {
  state.priority = e.target.value;
  renderTasks();
});

$$(".nav-item").forEach(item => item.addEventListener("click", () => switchView(item.dataset.view)));
$("#notificationBtn").addEventListener("click", () => showToast("You have 3 recent task updates."));
$("#userMenuBtn").addEventListener("click", () => showToast("Project Admin • Administrator"));
$("#clearActivityBtn").addEventListener("click", () => {
  state.activity = [];
  renderActivity();
  showToast("Activity log cleared.");
});

document.addEventListener("keydown", e => {
  if (e.key === "Escape") closeModal();
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
    e.preventDefault();
    openModal();
  }
});

function simulateRunningTasks() {
  state.tasks.forEach(task => {
    if (task.status === "running" && task.progress < 100) {
      task.progress = Math.min(100, task.progress + Math.floor(Math.random() * 4));
      if (task.progress >= 100) {
        task.status = "completed";
        task.eta = "Done";
        addActivity("✓", "Task completed", `${task.name} finished successfully.`);
        showToast(`${task.name} completed.`, "success");
      }
    }
  });
  updateStats();
  renderTasks();
  if (state.selectedId) renderDetail();
}
setInterval(simulateRunningTasks, 5000);

updateStats();
renderTasks();
renderDetail();
renderActivity();
renderAgents();
