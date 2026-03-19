# Knowledge Document Orchestration Platform --- Enterprise PRD (Full)

## 1. Product Purpose

This platform enables governed lifecycle orchestration of Knowledge
Documents across three actors: - POC (Content Owner) - BUFM (Finance
Approver) - KMT (Governance Authority)

Includes: - GIS dependency validation - RSAUI product dependency
validation - Template builder - Multi-stage approvals - Versioning -
Expiry & Archive lifecycle

------------------------------------------------------------------------

## 2. Role Based Login Behaviour

### Login Screen

-   User enters credentials
-   System detects role
-   Redirects to respective dashboard

Negative Scenarios: - Invalid credentials → Inline error message - Role
not assigned → "Contact Administrator" state

------------------------------------------------------------------------

## 3. POC UX FLOW (Screen-wise)

### 3.1 Knowledge Dashboard Screen

Components: - Left Sidebar Navigation - Top KPI Strip - Tabs: - My
Tasks - Draft - Awaiting Approval - All Documents - Archived

Table Columns: - Document Name - Status Badge - Progress % - Last
Updated - Version - Actions (Edit / Clone / Delete / View)

Negative Scenarios: - No Documents → Empty state with CTA "Create
Knowledge Document" - Network error → Retry toast - Unauthorized
template → Hidden row

------------------------------------------------------------------------

### 3.2 Create Document Screen

Fields: - Line of Business - Market Type - Service Area

System Validation: Coverage Boundary Exists?

Negative: - Coverage Missing → Blocking banner + Redirect button to GIS

------------------------------------------------------------------------

### 3.3 GIS Dependency State Screen

States: - Waiting for Coverage - Coverage Updated Success

Negative: - GIS timeout → Retry / Contact GIS - Invalid polygon →
Validation message

------------------------------------------------------------------------

### 3.4 RSAUI Dependency Screen

POC Updates: - Product Category - Pricing - Service Offering

Actions: - Save - Submit for BUFM Approval

Negative: - Missing mandatory fields - Pricing mismatch warning -
Approval rejected → Comment visible

------------------------------------------------------------------------

### 3.5 Template Builder Screen (Hero Screen)

Layout: - Left Section Navigator - Center Builder Canvas - Right
Workflow Panel

Hierarchy: Tab → Group → Field

Supported Fields: Text, Number, Currency, Percentage, URL, Dropdown,
Checkbox, Radio, Date, File Upload

Field Controls: - Mandatory toggle - Max length - Dependency rule -
Placeholder text

Group Actions: - Duplicate - Collapse - Drag reorder

Negative: - Dependency conflict warning - Field deletion confirmation -
Unsaved changes modal

------------------------------------------------------------------------

### 3.6 Draft State UX

Save Draft: - Progress bar updates - Appears in Draft Tab

Negative: - Partial save failure → Inline indicator - Session timeout →
Auto restore draft

------------------------------------------------------------------------

### 3.7 Submit for Approval UX

State: Awaiting BUFM

Right Panel Shows: - Approval chain - Pending user

Negative: - Submit blocked if required sections incomplete

------------------------------------------------------------------------

### 3.8 Rejection UX

If BUFM or KMT rejects:

-   Appears in My Tasks
-   Comment timeline visible
-   Version auto increment

Negative: - Multiple rejection loops → Version badge highlight

------------------------------------------------------------------------

### 3.9 Published Screen

Components: - Read only template - Version history panel - Expiry badge

Actions: - Create New Version - Clone - Archive

------------------------------------------------------------------------

### 3.10 Expiry UX

States: - Expiring Soon (Yellow) - Expired (Red)

System Notification: - Sent to KMT + POC

Negative: - Expired document usage warning

------------------------------------------------------------------------

### 3.11 Archive Screen

Archived List: - Archived Date - Published Version - Clone option

Negative: - Archive blocked if active dependency

------------------------------------------------------------------------

## 4. BUFM UX FLOW

### Dashboard

Shows: - Assigned POC Users - RSAUI Requests - Pending Documents

### Review Screen

Capabilities: - View tab structure - Inline comment - Approve / Reject

Negative: - Conflict approval (already approved by another BUFM) -
Expired dependency warning

------------------------------------------------------------------------

## 5. KMT UX FLOW

### Template Creation Screen

Capabilities: - Create template - Assign role access - Configure
governance

Negative: - Template publish blocked if no approver assigned

### Final Review Screen

Capabilities: - Edit fields - View BUFM comments - Approve / Reject

### Lifecycle Monitoring Screen

Lists: - Expiring documents - Archived documents - Version replacements

Negative: - Forced archive override confirmation

------------------------------------------------------------------------

## 6. Versioning Behaviour

-   Draft save → no version increment
-   Rejection → version increment
-   Publish → version milestone

------------------------------------------------------------------------

## 7. Notifications

-   Template assigned → POC
-   RSAUI approval → BUFM
-   Final approval → POC
-   Expiry reminder → KMT

------------------------------------------------------------------------

## 8. Design System (From Reference UI)

Primary Blue: #3B82F6 Sidebar Deep Blue: #2C5A85 Background: #F5F7FA
Card Border: #E5E7EB

Status: Draft Yellow: #FACC15 Rejected Red: #EF4444 Published Green:
#22C55E Archived Grey: #9CA3AF

Buttons: Primary → Blue fill + White text + 10px radius Secondary →
Outline Grey

Typography: Heading SemiBold Body Regular Meta Muted Grey

Cards: White Soft shadow 12px radius

------------------------------------------------------------------------

*The following sections extend the PRD with security, non-functional, and engineering delivery standards. They are numbered 9–13 so they follow Section 8 (Design System) without renumbering Sections 6–8 above.*

## 9. Security Requirements

### Authentication & Authorization

-   JWT required for protected routes.
-   Token must include user ID and role.
-   Token expiration enforced.
-   Ownership verification required.
-   No privilege escalation allowed.

### Password Security

-   No plaintext password storage.
-   No sensitive data in logs.
-   Secrets stored via environment variables only.
-   .env excluded from version control.

### Input Validation

-   Server-side validation mandatory.
-   Schema validation enforced.
-   Reject unexpected fields.
-   Validate file type and size.

### Database Security

-   Parameterized queries only.
-   No SQL string concatenation.
-   Prevent SQL injection and IDOR.
-   Sensitive fields excluded from responses.

### File Security

-   Prevent path traversal.
-   Secure streaming of files.
-   Files stored outside public directory.

### Rate Limiting

-   Login endpoint rate-limited.
-   Upload endpoint rate-limited.
-   Payload size limits enforced.

### Error Handling

-   Centralized error middleware.
-   No stack traces in production.
-   Standard API response format:

```json
{
  "status": "success | error",
  "message": "string",
  "data": {}
}
```

------------------------------------------------------------------------

## 10. Non-Functional Requirements

### Performance

-   API response \< 500ms (metadata operations).
-   Search \< 2 seconds.
-   Pagination required.
-   Support ≥ 1,000 concurrent users.
-   Stream large files.

### Availability & Reliability

-   99.5% uptime.
-   Daily encrypted backups.
-   RPO ≤ 24h.
-   RTO ≤ 24h.
-   Health check endpoints required.

### Scalability

-   Stateless backend.
-   Horizontal API scaling.
-   Indexed database.
-   Support 10x data growth in 2 years.

### Compliance

-   GDPR:
    -   Data access
    -   Data deletion
    -   Data portability
-   CCPA alignment.
-   Immutable audit logs.
-   Documented retention policies.

### Usability

-   Responsive UI.
-   Clear upload feedback.
-   Minimal steps for upload/share.
-   WCAG 2.1 AA target.

------------------------------------------------------------------------

## 11. Code Quality Requirements

-   Modular architecture:
    -   routes/
    -   controllers/
    -   services/
    -   middleware/
    -   db/
    -   config/
    -   utils/
-   Separation of concerns required.
-   No monolithic files.
-   ESLint + Prettier enforced.
-   No lint warnings in production.

------------------------------------------------------------------------

## 12. DevSecOps

-   CI must run:
    -   Lint
    -   Dependency audit
    -   Security scan
-   High-severity vulnerabilities block merge.
-   Secrets scanning required.

------------------------------------------------------------------------

## 13. Definition of Done

The system is production-ready when:

-   All endpoints authenticated.
-   RBAC verified.
-   Encryption implemented.
-   Parameterized queries enforced.
-   Validation implemented.
-   No critical vulnerabilities detected.
-   CI security checks passing.
