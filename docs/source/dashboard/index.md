# Dashboard

Local observability for Archon projects — reads `.archon/` ledgers and renders them as a visual dashboard. Distilgent's in-project implementation; other adopters can fork or point their own UI at the same schema.

| File | Role |
|------|------|
| [`server.js`](/source/dashboard/server) | HTTP entry point; serves static UI + JSON APIs |
| [`inference.js`](/source/dashboard/inference) | Derives cross-ledger views (cadence, debt heat, drift timeline) |
| [`providers.js`](/source/dashboard/providers) | File-system ledger readers (soul, manifest, drift, debt, memos) |
| [`schema.js`](/source/dashboard/schema) | Canonical response shape for the dashboard API |
| [`package.json`](/source/dashboard/package) | Node deps + npm scripts |
| [`public/public-index`](/source/dashboard/public/public-index) | Static HTML shell |
| [`public/css/styles`](/source/dashboard/public/css/styles) | Dashboard CSS |
| [`public/js/app`](/source/dashboard/public/js/app) | Client app bootstrap |
| [`public/js/components`](/source/dashboard/public/js/components) | Shared UI components |
| [`public/js/views`](/source/dashboard/public/js/views) | Dashboard view controllers |
| [`public/js/views-trace`](/source/dashboard/public/js/views-trace) | Trace / replay views |
| [`public/js/workflow`](/source/dashboard/public/js/workflow) | Workflow visualisation |
| [`public/js/workflow-data`](/source/dashboard/public/js/workflow-data) | Workflow data adapter |

See the [Dashboard Redesign PRD](/setup/dashboard-prd) for design intent and roadmap.
