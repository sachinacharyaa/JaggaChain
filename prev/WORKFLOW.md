# JaggaChain – User, Admin & Public Workflow

This guide explains how to use the **Citizen Portal**, **Admin Panel**, and **Public Explorer** with the demo data.

---

## Demo accounts (dummy data)

After the backend seeds, you have:

| Role | Name | Wallet address |
|------|------|----------------|
| **User A** | Sachin Acharya | `G6DKYcQnySUk1ZYYuR1HMovVscWjAtyDQb6GhqrvJYnw` |
| **User B** | Hari Prasad Shah | `sDHAt4Sfn556SXvKddXjCwAeKaMpLHEKKWcfG7hfmoz` |

- **Sachin Acharya** owns **3 parcels**: KTM-001-100, KTM-002-101, CHT-005-301  
- **Hari Prasad Shah** owns **2 parcels**: KTM-003-102, PKR-004-200  
- **Pending transfers**:  
  - KTM-001-100 (Sachin → Hari)  
  - KTM-003-102 (Hari → Sachin)

---

## 1. Public Explorer (no wallet)

**URL:** `http://localhost:3000/explorer`

- Anyone can use it; no wallet needed.
- **On load:** Shows **all parcels** (e.g. 5 demo parcels).
- **Search:** By parcel ID, location, or owner name (e.g. `KTM-001`, `Kathmandu`, `Sachin`).
- **Click a parcel:** Opens detail page (owner, area, location, document hash).
- **No results:** Search shows “No parcels found” or similar; list is empty if backend has no data.

**Typical flow:**
1. Open Explorer → see list of parcels.
2. Use search → get filtered list.
3. Click a parcel → view details.

---

## 2. Citizen Portal (user / “My Parcels”)

**URL:** `http://localhost:3000/citizen`

- User must **connect a Solana wallet** (e.g. Phantom).
- **“My Parcels”** = parcels owned by the **connected wallet** (from backend `GET /my-parcels/:wallet`).
- **Transfer requests** = requests where the connected wallet is **seller** (outgoing) or **buyer** (incoming).

**Workflow:**

1. **Connect wallet** (e.g. Sachin’s: `G6DK...JYnw`).
2. Page loads and calls:
   - `GET /my-parcels/<wallet>` → **Owned Parcels** count and list.
   - `GET /transfers?seller=<wallet>` → **Transfer Requests** (as seller).
3. **Sachin** should see:
   - **Owned Parcels: 3** (KTM-001-100, KTM-002-101, CHT-005-301).
   - **Transfer Requests: 1** (KTM-001-100 → Hari, Pending).
4. **Hari** should see:
   - **Owned Parcels: 2** (KTM-003-102, PKR-004-200).
   - **Transfer Requests: 1** (KTM-003-102 → Sachin, Pending).
5. Use **Refresh** to reload data.

If you see **0 parcels / 0 transfers**, check:
- Backend is running and **seed has run** (see below).
- You are connected with the **correct wallet** (same as in the table above).

---

## 3. Admin Panel

**URL:** `http://localhost:3000/admin`

- Admin must **connect a wallet** (demo: Sachin or Hari are officers).
- Click **“Load Admin Data”** to fetch:
  - Officers  
  - Whitelisted wallets  
  - **All parcels**  
  - **Pending transfers**

**Workflow:**

1. Connect wallet (e.g. Sachin or Hari).
2. Click **“Load Admin Data”**.
3. You should see:
   - **Officers** (e.g. 2): Sachin (SuperAdmin), Hari (TransferOfficer).
   - **Whitelisted Wallets** (e.g. 2): same two wallets.
   - **All Parcels** (e.g. 5): list with parcel ID, location, owner.
   - **Pending Transfers** (e.g. 2): parcel, seller → buyer, status “Pending”.
4. **Approve** flow (when wired to chain): use “Approve” on a pending transfer; on-chain tx moves NFT and status updates.

---

## 4. Making sure data is there (seed)

- Seed runs automatically when backend starts in **non-production** (e.g. `npm run start:dev` without `NODE_ENV=production`).
- If **Citizen / Admin / Explorer** show no data:
  1. Restart backend (so seed runs again), or  
  2. Call **seed** once:  
     **GET** `http://localhost:3001/seed`  
     (Only works when `NODE_ENV` is not `production`.)
  3. Refresh the frontend (and click “Load Admin Data” on Admin again if needed).

---

## 5. Quick reference

| View | URL | Needs wallet? | What it shows |
|------|-----|----------------|----------------|
| **Public Explorer** | `/explorer` | No | All parcels; search by ID/location/owner |
| **Citizen Portal** | `/citizen` | Yes | My Parcels (by wallet) + Transfer Requests (as seller) |
| **Admin Panel** | `/admin` | Yes | Officers, Whitelist, All Parcels, Pending Transfers (after “Load Admin Data”) |

---

## 6. Demo flow (end-to-end)

1. **Explorer:** Open `/explorer` → see 5 parcels → search “Sachin” → click KTM-001-100 → view details.  
2. **Citizen (Sachin):** Connect Sachin’s wallet → `/citizen` → see 3 owned parcels and 1 pending transfer (KTM-001-100 to Hari).  
3. **Citizen (Hari):** Connect Hari’s wallet → `/citizen` → see 2 owned parcels and 1 pending transfer (KTM-003-102 to Sachin).  
4. **Admin:** Connect either wallet → `/admin` → “Load Admin Data” → see all parcels and 2 pending transfers.

If anything shows empty, run **GET** `http://localhost:3001/seed` and refresh the app.
