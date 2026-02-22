# Port Configuration Guide 🔌

## Correct Port Setup

### ✅ Frontend: Port 3000
- **URL**: http://localhost:3000
- **Config**: `frontend/package.json` → `"dev": "next dev -p 3000"`

### ✅ Backend: Port 3001
- **URL**: http://localhost:3001
- **Config**: `backend/.env` → `PORT=3001`

## Why This Matters

The frontend needs to connect to the backend API:
- Frontend runs on: `http://localhost:3000`
- Backend API on: `http://localhost:3001`
- Frontend config: `NEXT_PUBLIC_BACKEND_URL=http://localhost:3001`

If both run on the same port, they conflict!

## Fixed Configuration

### Frontend (`frontend/package.json`)
```json
{
  "scripts": {
    "dev": "next dev -p 3000"  // ← Explicitly set to port 3000
  }
}
```

### Backend (`backend/.env`)
```
PORT=3001  // ← Backend on port 3001
```

### Frontend Environment (`frontend/.env.local`)
```
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001  // ← Points to backend
```

## How to Restart Correctly

### Step 1: Stop All Servers
```bash
# Kill anything on port 3000
Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | 
  Select-Object OwningProcess | 
  ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }

# Kill anything on port 3001
Get-NetTCPConnection -LocalPort 3001 -ErrorAction SilentlyContinue | 
  Select-Object OwningProcess | 
  ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }
```

### Step 2: Start Backend (Port 3001)
```bash
cd backend
npm run start:dev
```
**Should see:** `JaggaChain Backend running on http://localhost:3001`

### Step 3: Start Frontend (Port 3000)
```bash
cd frontend
npm run dev
```
**Should see:** `Local: http://localhost:3000` (NOT 3001!)

## Verification

### Check Ports Are Correct:
```bash
# Check what's on each port
Get-NetTCPConnection -LocalPort 3000 | Select-Object OwningProcess, State
Get-NetTCPConnection -LocalPort 3001 | Select-Object OwningProcess, State
```

### Test URLs:
- ✅ Frontend: http://localhost:3000 (should load UI)
- ✅ Backend: http://localhost:3001/health (should return `{"status":"healthy"}`)
- ✅ Backend API: http://localhost:3001/parcels (should return parcels array)

## Troubleshooting

### Problem: Frontend still on 3001
**Solution:**
1. Stop frontend (Ctrl+C)
2. Kill process on 3000: `Get-NetTCPConnection -LocalPort 3000 | Stop-Process -Id {OwningProcess}`
3. Restart: `npm run dev`
4. Should now say: `Local: http://localhost:3000`

### Problem: Port 3000 still in use
**Solution:**
```bash
# Find what's using port 3000
Get-NetTCPConnection -LocalPort 3000

# Kill it
Stop-Process -Id {OwningProcess} -Force
```

### Problem: Backend can't start on 3001
**Solution:**
```bash
# Check if something is using 3001
Get-NetTCPConnection -LocalPort 3001

# Kill it if needed
Stop-Process -Id {OwningProcess} -Force

# Or change backend port in backend/.env
PORT=3002
# Then update frontend/.env.local
NEXT_PUBLIC_BACKEND_URL=http://localhost:3002
```

## Summary

- ✅ **Frontend**: Port 3000 (fixed in package.json)
- ✅ **Backend**: Port 3001 (configured in .env)
- ✅ **Connection**: Frontend → Backend (3000 → 3001)

**Now restart both servers and they should use the correct ports!**
