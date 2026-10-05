# AgentOS — Agent Execution History

A responsive glassmorphism dark UI template for viewing and managing AI agent execution history.

## What this UI demonstrates

- Search execution history by task name, run ID, agent, status, trigger, task description, or timeline step
- Status and agent filters
- Working date-range filter: Last 30 days, Last 7 days, Today, All time
- Table and card views
- Pagination
- Execution detail drawer with timeline and output
- New Run modal that adds a live execution to the history
- CSV export of the currently filtered results
- Notifications panel
- Settings toggles
- Help interactions
- Responsive mobile navigation
- Keyboard shortcuts: `Ctrl/Cmd + K` for search and `Esc` to close overlays

## Tech

- HTML5
- CSS3
- Vanilla JavaScript
- No frameworks
- No external dependencies
- Works offline after extraction

## Run

1. Extract the ZIP.
2. Open `index.html` in a modern browser.
3. No installation or build step is required.

## Suggested GitHub structure

```text
agent-execution-history/
├── index.html
├── style.css
├── script.js
└── README.md
```

## UI pattern

**Agent Execution History** is an observability interface used to review completed, running, and failed AI-agent executions. It helps users quickly find a run, inspect its execution timeline, understand the agent and trigger, and export filtered history.

## Design / interaction pattern

The interface uses dark glassmorphism cards, compact data tables, status badges, filters, pagination, a slide-in execution drawer, and responsive navigation. The implementation is dependency-free so the UI can be demonstrated directly from the downloaded files.

## Team

Add your team member names and individual contributions here before submission.

## Screenshots

Add screenshots of the final running website here for the hackathon submission.
