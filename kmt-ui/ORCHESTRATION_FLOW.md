# Knowledge Document Orchestration — UI flow (three actors)

This document maps the **demo UI** in `kmt-ui` to the enterprise PRD. Data is **shared in-browser**:

- **Knowledge documents**: `PocDocumentsProvider` + `localStorage` key `kmt.poc.documents.v14`
- **RSAUI approval queue**: `RsauiQueueProvider` + `kmt.rsaui.queue.v1`

POC, BUFM, and KMT sessions behave like a **live queue** across tabs and role logins (`storage` events).

## Global layout

- **Left sidebar** — Role-specific nav (POC: Knowledge Documents, RSAUI Tool, Reports, Training, Settings).
- **Top bar** — User, role, sign out.
- **Document builder** — Header strip: **status badge**, **version**, **expiry** (demo placeholder), **Save draft / Submit**; main canvas with tabs/groups/fields; **right context panel**: workflow, dependency, version line, comments.

## POC (Content Owner)

| Step | UI |
|------|----|
| Dashboard | Tabs: **My Tasks**, **Draft Documents**, **Awaiting Approval**, **All Documents**, **Archived**. Table + empty state CTA **Create Knowledge Document**. |
| Create / edit | Template picker, draggable **tabs → groups → fields**. Field types include **Text, Number, Currency, %, Date, Time** (native pickers when editing), **Notes** block, etc. |
| Field settings | **Description**, **notes callout** + position, **custom icon** upload + position, **tab bar button** placement **Left / Right**. |
| Draft | **Save as draft** → list shows **Draft** + workflow copy. |
| Submit | **Submit for approval** → **In review**, builder locked; BUFM queue updates in real time (same store). |
| After BUFM approve | Status **Awaiting KMT**; POC sees locked builder until KMT publishes or rejects. |
| Rejection | **My Tasks**; BUFM/KMT comments + **Comment timeline** in view modal; edit and resubmit. |
| Published | **View (read-only)**; clone for a new version. |
| Archived | **Archived** tab; read-only; clone to draft. |

## BUFM (Finance Reviewer)

| Step | UI |
|------|----|
| Dashboard | Widgets: pending RSAUI, pending knowledge reviews, recently published. **Unified table** (knowledge + RSAUI rows) → **Review**. |
| Knowledge review | `/bufm/review/:id` — left tab nav, center accordion + field-type badges + preview, right workflow + **comment thread**; **Approve** → `awaiting_kmt`; **Reject** / **Add comment**. |
| RSAUI review | `/bufm/rsa-ui/:id` — product / pricing / coverage / highlights; outdated banner; right comments; **Approve** / **Reject** / **Add comment**. |
| Monitoring | `/bufm/monitoring` — tabs Pending / Approved / Rejected + progress strip. |

## KMT (Governance Admin)

| Step | UI |
|------|----|
| Login | Redirects to **`/kmt/dashboard`**. |
| Sidebar IA | **Template Governance** → Templates, Template Assignments. **Knowledge Governance** → Review queue, Expiry queue, Published library, Archived library, RSAUI queue. **Users**, **Reports**; **Settings** in sidebar footer. |
| Templates list | **`/kmt/governance/templates`** — **+ Create template** → modal (name, description, LOB, market) → **`/kmt/governance/templates/builder`**. |
| Template builder | Header name + **Draft / Published template** badge; **Save** / **Publish**; Actors & rules (POC, BUFM, KMT); inline warning before POC+BUFM assigned. |
| Template assignments | **`/kmt/governance/template-assignments`** — table + row drawer; profile **`/kmt/governance/template-assignments/:userId`**. Legacy **`/kmt/governance/user-access`** redirects. |
| Users | **`/kmt/users`** — directory (demo roster). |
| Knowledge queue | **`/kmt/knowledge/review`** — View details → **`/kmt/knowledge/document/:docId`** (tabs); **Approve** / **Send back** / **Edit template**. Legacy **`/kmt/review/knowledge`** redirects. |
| RSAUI queue | **`/kmt/review/rsaui`** — **`/kmt/review/rsaui/:docId`**. |
| Published library | **`/kmt/knowledge/published`**. |
| Expiry queue | **`/kmt/knowledge/expiry`** — days remaining; extend / new version / archive. |
| Archived library | **`/kmt/knowledge/archived`** — reason, restore, clone. **`/kmt/lifecycle/*`** redirects. |
| Final review | `/kmt/review/:id` — deep workspace; links updated to review queue path. |
| Document edit (KMT) | `/kmt/document/:docId` — **Save changes** / **Publish** (when `awaiting_kmt`); publish uses `approveByKmt(id, snapshot)`. |
| Published | `/kmt/published/:id` — success + explorer; back → published library. |
| Reports | `/kmt/reports`. |
| Archive | `/kmt/archive/:id` — approve → `archived`; back → archived list. |

## Realtime behaviour

- Same browser: React context updates immediately.
- **Other tabs**: `storage` event on `kmt.poc.documents.v14` refreshes documents.
- Production would replace this with API + WebSocket or polling.

## Negative / edge states (PRD checklist)

Partially modeled in UI copy and banners: missing dependency (RSAUI/GIS messaging), rejection, read-only published. Not fully implemented: session timeout, network failure, permission denied, circular dependency validation, unsaved-changes modal — add when backend exists.
