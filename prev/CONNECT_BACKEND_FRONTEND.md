# Connect Backend and Frontend ✅

## Problem
Frontend shows **"Backend Disconnected"** because nothing is listening on port 3001.

## Solution: Start the backend and wait for it to be ready

### Step 1: Start backend first

In a terminal:

```bash
cd D:\JaggaChain\backend
npm run start:dev
```

Wait until you see **all** of these lines (can take 1–2 minutes):

```
[XX:XX:XX] Found 0 errors. Watching for file changes.
[Nest] XXXXX  - ... LOG [NestFactory] Starting Nest application...
[Nest] XXXXX  - ... LOG [InstanceLoader] TypeOrmModule dependencies initialized
...
[Nest] XXXXX  - ... LOG [NestApplication] Nest application successfully started
JaggaChain Backend running on http://localhost:3001
```

If you see **"Seeding dummy data"** and **"Seeding completed"**, that’s normal.

Do **not** use the frontend until you see: **`JaggaChain Backend running on http://localhost:3001`**.

### Step 2: Start frontend

In a **second** terminal:

```bash
cd D:\JaggaChain\frontend
npm run dev
```

Open: **http://localhost:3000**

### Step 3: Check connection

- Bottom-right of the page should show **"Backend Connected"** (green).
- If it still says **"Backend Disconnected"**:
  1. Confirm the backend terminal shows: `JaggaChain Backend running on http://localhost:3001`
  2. In the browser, click **"Retry"** on the red status box.
  3. Wait a few seconds; the frontend checks every 5 seconds.

## If backend never shows "running on 3001"

### 1. Port 3001 in use

```powershell
Get-NetTCPConnection -LocalPort 3001 -ErrorAction SilentlyContinue
```

If something is using 3001, stop that process or change the backend port in `backend/.env`:

```env
PORT=3002
```

Then in `frontend/.env.local`:

```
NEXT_PUBLIC_BACKEND_URL=http://localhost:3002
```

### 2. MongoDB connection failed

Backend logs may show MongoDB errors. Check:

- `backend/.env` has correct `MONGO_URL`
- MongoDB Atlas allows your IP (or use 0.0.0.0/0 for testing)

### 3. Backend crashes after compile

Read the full backend terminal output for errors (e.g. missing env, DB error). Fix those first, then run `npm run start:dev` again.

## Summary

| Service  | Port | URL                      |
|----------|------|---------------------------|
| Frontend | 3000 | http://localhost:3000     |
| Backend  | 3001 | http://localhost:3001     |

- Start **backend first**, wait for **"JaggaChain Backend running on http://localhost:3001"**.
- Then start **frontend** and open http://localhost:3000.
- Status will turn green when the backend is reachable; you can click **Retry** if it’s slow.
