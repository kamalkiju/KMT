# CEUI / KMT — Knowledge Document Orchestration (UI)

Vite + React + TypeScript frontend-only shell aligned with `enterprise-full-prd.md` and the reference layouts (sidebar `#2C5A85`, primary `#3B82F6`, background `#F5F7FA`).

## Run

```bash
cd kmt-ui
npm install
npm run dev
```

The dev server is configured for **127.0.0.1:5177** (`vite.config.ts`), which behaves like [http://localhost:5177](http://localhost:5177) on your machine.

### Public URL (one command)

After a one-time [ngrok authtoken](https://dashboard.ngrok.com/) (`ngrok config add-authtoken YOUR_TOKEN`), run:

```bash
npm run dev:share
```

This starts Vite and a tunnel to port **5177** together (local `ngrok` from `devDependencies`). The ngrok pane prints the public URL. Use **Ctrl+C** once to stop both.

**Reserved dev domain** (from the ngrok dashboard): set `NGROK_DOMAIN` so the tunnel uses your fixed hostname instead of a random one. Until a tunnel is running, the dashboard will show **0 Endpoints**.

```bash
export NGROK_DOMAIN=your-name.ngrok-free.dev   # your dashboard “Copy domain” value
npm run dev:share
```

Manual alternative: `npm run dev` in one terminal, then `ngrok http 5177 --domain=your-name.ngrok-free.dev` in another. First-time visitors may see ngrok’s interstitial page.

**`zsh: command not found: ngrok`:** use the project binary from `kmt-ui`:

```bash
./node_modules/ngrok/bin/ngrok config add-authtoken YOUR_TOKEN
```

**`no such file or directory: ./node_modules/ngrok/bin/ngrok`:** the binary is missing under `node_modules` (often **antivirus or endpoint security deletes new executables there**). The project unpacks a copy into **`.ngrok-native/ngrok`** (gitignored) from the zip cached in `~/.ngrok/`. Run:

```bash
npm run ngrok:fetch    # or: npm run dev:share — predev:share runs ensure-ngrok
ls -la .ngrok-native/ngrok
```

Use that path for `config add-authtoken` if needed: `./.ngrok-native/ngrok config add-authtoken 'YOUR_TOKEN'`. Or install globally: `brew install ngrok/ngrok/ngrok`.

## Auth (demo)

- Open `/login`, pick **POC**, **BUFM**, or **KMT**, enter any non-empty password.
- Routes under `/poc/...`, `/bufm/...`, and `/kmt/...` are gated by the selected role (session storage).
- Wrong-role URLs redirect to login.

## POC flow (static / localStorage)

- **Knowledge Documents** (`/poc/dashboard`): lists documents from `localStorage`; tabs filter by status.
- **Create** → `/poc/document/new` opens the **form builder** (document template selector, drag-and-drop fields/tabs/groups, Save as draft, Submit for approval).
- **Edit** reopens the same builder with the saved structure. **In review** locks editing; **Rejected** unlocks for changes.
- **View** opens a read-only detail modal. **Clone** duplicates the document into a new draft and opens it in the builder.
- **RSAUI Tool** in the sidebar: if any document has a pending RSAUI dependency flag, a popup explains updates are needed before opening the external tool.

## Structure

- `src/styles/tokens.css` — design tokens (no inline styles in components; dynamic bars use SVG geometry).
- `src/context/PocDocumentsContext.tsx` — POC document list + persistence.
- `src/components/` — layout shell, reusable UI, POC view modal.
- `src/pages/` — screens per actor and shared styles.
- `src/routes/` — `AppRoutes`, `PocProtectedLayout`, `ProtectedLayout`.

## Build

```bash
npm run build
```

## Deploy (Vercel)

This app lives in the **`kmt-ui`** folder at the repo root. Vercel must use that as the project root.

1. Open [vercel.com](https://vercel.com) → **Add New…** → **Project** → import **`kamalkiju/KMT`** (or your fork).
2. Under **Configure Project**:
   - **Root Directory**: `kmt-ui` (click Edit → set to `kmt-ui`).
   - **Framework Preset**: Vite (auto-detected).
   - **Build Command**: `npm run build` (default).
   - **Output Directory**: `dist` (default for Vite).
3. **Deploy**. Every push to the connected branch redeploys.

`vercel.json` in `kmt-ui` adds SPA rewrites so deep links (e.g. `/kmt/dashboard`) load `index.html` and React Router works.

**Note:** Demo data uses **browser `localStorage`** — it is per-device, not shared across users. Ngrok is only for local sharing; production uses your Vercel URL.
