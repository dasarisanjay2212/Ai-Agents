# Agent Config & Permissions

**Owner:** Member 6 · Part of the `ai-agent-ui-collection` project.

A control panel where you pick an AI agent, adjust how it runs, and choose exactly what it is allowed to do.

## Features
- Agent list with enabled/disabled status and permission count
- Run settings: model tier, creativity (temperature), max steps per task
- 8 permissions in 3 groups (Data, Communication, System), each with a risk level
- Presets: Read-only, Standard, Full access
- Confirmation prompt before enabling high-risk permissions
- Unsaved-changes bar with **Save changes** / **Discard**
- Settings persist in the browser (`localStorage`)
- Responsive layout, keyboard focus styles, light/dark theme, reduced-motion support

## Files
| File | Purpose |
|------|---------|
| `index.html` | Page structure |
| `style.css` | Styling and themes |
| `script.js` | Data, rendering, save/discard logic |

## Run it
Open `index.html` in a browser. No build step or dependencies.

## Customize
- Add or edit agents in `DEFAULT_AGENTS` in `script.js`.
- Add permissions in `PERMISSIONS` (set `risk` to `low`, `medium`, or `high`).
- To reset saved data, clear the `agentConfigPermissions.v1` key in browser storage.

## Integration
The hub (`../index.html`) should link to `agent-config-permissions/index.html`. This page links back with `../index.html`.
