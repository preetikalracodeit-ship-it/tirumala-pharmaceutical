# Medical Distribution System — Production Deployment

This `deploy/` folder is the complete, self-contained production package.  
Backend is pre-compiled to `backend/dist/`. Frontend is pre-built in `frontend/.next/`.

---

## Folder Structure

```
deploy/
├── backend/
│   ├── dist/               ← Compiled Express API (Node.js ESM)
│   ├── database/
│   │   └── schema.sql      ← MySQL schema (run once on a fresh DB)
│   ├── scripts/            ← DB setup / debug utilities
│   ├── data/
│   │   └── medical.db      ← SQLite DB (used when DB_DRIVER=sqlite)
│   ├── uploads/            ← User-uploaded files (writable at runtime)
│   ├── reset-admin.mjs     ← Reset admin password utility
│   ├── package.json
│   └── .env.production     ← ← COPY TO .env AND FILL IN
│
├── frontend/
│   ├── .next/              ← Next.js production build
│   ├── public/             ← Static assets (images, videos)
│   ├── next.config.mjs
│   ├── package.json
│   └── .env.production     ← ← COPY TO .env.local AND FILL IN
│
├── start.mjs               ← Starts both servers (simple deployments)
├── package.json            ← Root convenience scripts
├── ecosystem.config.cjs    ← PM2 config (VPS/bare-metal)
├── Dockerfile              ← Multi-stage Docker build
├── docker-compose.yml      ← Docker Compose (app + MySQL)
├── nginx.conf              ← Nginx reverse-proxy config
└── README.md               ← This file
```

---

## Step 1 — Configure Environment Variables

### Backend
```bash
cp backend/.env.production backend/.env
```
Edit `backend/.env`:
| Variable | Description |
|---|---|
| `DB_DRIVER` | `mysql` (production) or `sqlite` (quick start) |
| `DB_HOST` | MySQL host (e.g. `127.0.0.1` or RDS endpoint) |
| `DB_PASSWORD` | Your MySQL root/app password |
| `JWT_SECRET` | Long random string — **must be secret** |
| `NODE_ENV` | Set to `production` |
| `PORT` | Backend port (default `3001`) |

### Frontend
```bash
cp frontend/.env.production frontend/.env.local
```
Edit `frontend/.env.local`:
| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | Full URL to your backend API, e.g. `https://api.yourdomain.com/api` |
| `NEXTAUTH_URL` | Your frontend domain, e.g. `https://yourdomain.com` |
| `NEXTAUTH_SECRET` | Random 32-char string (`openssl rand -base64 32`) |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | From [Google Cloud Console](https://console.cloud.google.com) |
| `FACEBOOK_CLIENT_ID` / `FACEBOOK_CLIENT_SECRET` | From [Facebook Developers](https://developers.facebook.com) |

> **Note:** `NEXT_PUBLIC_*` variables are baked into the frontend build at build time.  
> If you change `NEXT_PUBLIC_API_URL`, you need to re-run `npm run build` in the source `frontend/` and copy the new `.next/` folder.

---

## Step 2 — Install Dependencies

```bash
# From the deploy/ root
npm run install:all
```

Or manually:
```bash
cd backend  && npm ci --omit=dev
cd ../frontend && npm ci --omit=dev
```

---

## Step 3 — Set Up the Database

### MySQL (production)
```bash
# Connect to MySQL and run the schema:
mysql -u root -p < backend/database/schema.sql

# Or use the setup script:
cd backend && npm run db:setup
```

### SQLite (quick start / low traffic)
Set `DB_DRIVER=sqlite` in `backend/.env`. The SQLite file at `backend/data/medical.db` already contains schema and a default admin account.

**Default admin credentials:**
- Email: `admin@medical.com`
- Password: `admin123`

> Change the admin password immediately after first login.  
> To reset: `node backend/reset-admin.mjs`

---

## Deployment Options

### Option A — Simple Node.js (single server)

```bash
# From deploy/ root — starts both backend (3001) and frontend (3000)
node start.mjs
```

### Option B — PM2 (recommended for VPS / bare-metal)

```bash
npm install -g pm2

# Start both services
pm2 start ecosystem.config.cjs

# Persist across reboots
pm2 save
pm2 startup   # follow the printed command

# Useful commands
pm2 status
pm2 logs
pm2 restart all
```

### Option C — Docker Compose (easiest, fully isolated)

```bash
# Build and start everything (app + MySQL)
docker compose up -d --build

# View logs
docker compose logs -f

# Stop
docker compose down
```

**Required:** Set passwords/secrets in `backend/.env` and `frontend/.env.local` before running.

### Option D — Nginx Reverse Proxy (production-grade)

1. Deploy with PM2 (Option B) or Docker (Option C)
2. Install Nginx and copy the config:
   ```bash
   sudo cp nginx.conf /etc/nginx/sites-available/medical-dist
   sudo ln -s /etc/nginx/sites-available/medical-dist /etc/nginx/sites-enabled/
   # Edit nginx.conf — replace yourdomain.com with your actual domain
   sudo nginx -t && sudo systemctl reload nginx
   ```
3. Get free HTTPS via Let's Encrypt:
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d yourdomain.com -d api.yourdomain.com
   ```

---

## Cloud Platform Quick Deploy

### Railway (simplest)
1. Create two Railway services — one for `backend/`, one for `frontend/`
2. Set all env variables in the Railway dashboard
3. For backend: start command → `node dist/server.js`
4. For frontend: start command → `node node_modules/.bin/next start`

### Render
1. New Web Service → connect repo
2. Root Directory: `deploy/backend` (for backend service)
3. Build Command: *(leave empty — dist is pre-built)*
4. Start Command: `node dist/server.js`
5. Repeat for frontend with start command: `node node_modules/.bin/next start`

### Vercel (frontend only)
Vercel works best for the Next.js frontend. Deploy the source `frontend/` directory directly from your Git repo. Deploy the backend separately on Railway/Render/a VPS.

---

## Ports

| Service | Port | Description |
|---|---|---|
| Backend API | `3001` | Express REST API |
| Frontend | `3000` | Next.js web app |

In production behind Nginx, both are accessible on port `80`/`443` via subdomains.

---

## Health Check

```bash
curl http://localhost:3001/health
# {"status":"ok","database":"mysql","timestamp":"..."}
```

---

## Troubleshooting

| Problem | Fix |
|---|---|
| `Cannot find module` errors | Run `npm ci --omit=dev` in `backend/` |
| MySQL connection refused | Check `DB_HOST`, `DB_PORT`, `DB_PASSWORD` in `backend/.env` |
| Frontend shows "API error" | Check `NEXT_PUBLIC_API_URL` in `frontend/.env.local` |
| Login fails / JWT errors | Ensure `JWT_SECRET` is the same value used when tokens were issued |
| Blank page on reload | Make sure Next.js is running (`node node_modules/.bin/next start`) |
| OAuth not working | Verify `NEXTAUTH_URL` matches your actual domain exactly |
| Port already in use | Change `PORT` in `backend/.env` or kill existing process |
