# JaggaChain - Quick Start Guide 🚀

## Prerequisites ✅

- Node.js 18+ installed
- MongoDB Atlas account (or local MongoDB)
- Git (optional)

## Step 1: Clone & Install

```bash
# Navigate to project directory
cd D:\JaggaChain

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

## Step 2: Configure Backend

1. **Set up MongoDB**:
   - Create `backend/.env` file (copy from `backend/.env.example`):
     ```bash
     cp backend/.env.example backend/.env
     ```
   - Edit `backend/.env` and add your MongoDB URL:
     ```
     MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/jaggaChain
     ```
     Or use local MongoDB:
     ```
     MONGO_URL=mongodb://localhost:27017/jaggaChain
     ```
   - **Solana (optional):** Program IDs in `.env.example` match `Anchor.toml` for localnet. If you run a local validator, keep these; otherwise the app works with **seed data** only.
   - **⚠️ Never commit `.env` files!** They contain secrets and are already in `.gitignore`.

2. **Frontend env:** Ensure `frontend/.env.local` exists with `NEXT_PUBLIC_BACKEND_URL=http://localhost:3001` (or copy from `frontend/.env.local.example`).

3. **Backend is ready!** ✅

## Step 3: Start Backend

```bash
cd backend
npm run start:dev
```

**What happens:**
- Backend connects to MongoDB ✅
- Dummy data is automatically seeded ✅
- API server starts on `http://localhost:3001` ✅

**You'll see:**
```
🌱 Seeding dummy data...
✅ Seeded 2 officers
✅ Seeded 2 whitelisted wallets
✅ Seeded 5 parcels
✅ Seeded 2 transfer requests
🎉 Seeding completed!
JaggaChain Backend running on http://localhost:3001
```

**If you see no data in the app:** Open `http://localhost:3001/seed` in the browser (or run `curl http://localhost:3001/seed`) to re-run the seed, then refresh the frontend.

## Step 4: Start Frontend

**Open a NEW terminal** and run:

```bash
cd frontend
npm run dev
```

**What happens:**
- Next.js dev server starts ✅
- Frontend available at `http://localhost:3000` ✅

## Step 5: Access the Application

Open your browser and go to:

### 🌐 Public Explorer
**URL**: http://localhost:3000/explorer

**What you can do:**
- Search parcels by ID, location, or owner name
- View parcel details
- See transfer history

**Try searching:**
- `KTM-001-100` (Parcel ID)
- `Kathmandu` (Location)
- `Ram Bahadur` (Owner name)

### 👤 Citizen Portal
**URL**: http://localhost:3000/citizen

**Requirements:**
- Connect a Solana wallet (Phantom, Solflare, etc.)
- Wallet must be whitelisted (demo wallets are pre-whitelisted)

**What you can do:**
- View your parcels
- See transfer requests

### 🏛️ Admin Panel
**URL**: http://localhost:3000/admin

**Requirements:**
- Connect a Solana wallet
- Wallet must be registered as an officer

**What you can do:**
- View officers
- View whitelisted wallets
- Load admin data

## Demo Data Included 🎁

The system automatically seeds (when not in production):

- **5 Parcels**: Assigned to two demo users
  - **Sachin Acharya** (Wallet A): KTM-001-100, KTM-002-101, CHT-005-301
  - **Hari Prasad Shah** (Wallet B): KTM-003-102, PKR-004-200
  - Locations: Kathmandu, Lalitpur, Bhaktapur, Pokhara, Chitwan

- **2 Whitelisted Wallets**: The two demo user wallets (Sachin, Hari)

- **2 Officers**: Sachin (SuperAdmin), Hari (TransferOfficer)

- **2 Pending Transfer Requests**: KTM-001-100 (Sachin→Hari), KTM-003-102 (Hari→Sachin)

**Workflow guide:** See `WORKFLOW.md` for step-by-step User, Admin, and Public Explorer flows. For **full architecture** (Frontend ↔ Backend ↔ Solana), see `COMPLETE_WORKFLOW.md`.

## Troubleshooting 🔧

### Backend won't start?

1. **Check MongoDB connection**:
   - Verify MongoDB URL in `backend/.env`
   - Ensure MongoDB Atlas allows your IP

2. **Port 3001 already in use?**:
   ```bash
   # Windows PowerShell
   Get-NetTCPConnection -LocalPort 3001 | Stop-Process -Id {OwningProcess}
   ```

3. **Clear and restart**:
   ```bash
   cd backend
   rm -r dist  # or Remove-Item -Recurse dist (PowerShell)
   npm run start:dev
   ```

### Frontend won't start?

1. **Clear Next.js cache**:
   ```bash
   cd frontend
   Remove-Item -Recurse -Force .next
   npm run dev
   ```

2. **Check for errors**:
   - Look at terminal output
   - Check browser console (F12)

### No data showing?

1. **Backend must be running** ✅
2. **Check backend logs** for seeding messages
3. **Refresh browser** (Ctrl+Shift+R)

## Testing the System 🧪

### Test Public Explorer:
1. Go to http://localhost:3000/explorer
2. Search for `KTM-001`
3. Click on a parcel
4. View details ✅

### Test Citizen Portal:
1. Go to http://localhost:3000/citizen
2. Connect wallet (use demo wallet if available)
3. View parcels ✅

### Test Admin Panel:
1. Go to http://localhost:3000/admin
2. Connect wallet
3. Click "Load Admin Data"
4. View officers and wallets ✅

## Next Steps 📚

1. **Read Full Guide**: See `JAGGACHAIN_GUIDE.md` for detailed instructions
2. **Explore Features**: Try all three portals
3. **Check API**: Backend API at http://localhost:3001/health

## Support 💬

- Check `JAGGACHAIN_GUIDE.md` for detailed documentation
- Review backend logs for errors
- Check frontend console (F12) for frontend errors

---

**Happy Exploring! 🎉**
