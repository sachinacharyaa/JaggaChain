# JaggaChain – Complete Workflow: Frontend ↔ Backend ↔ Solana

This document describes how the **frontend**, **backend**, and **Solana** components work together and how to run them for a full workflow.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│  FRONTEND (Next.js, port 3000)                                           │
│  - Wallet: Phantom/Solflare via @solana/wallet-adapter                   │
│  - Calls backend REST API for parcels, transfers, admin                  │
│  - Connects to Solana RPC only for wallet/signing (optional on-chain)   │
└───────────────────────────────┬─────────────────────────────────────────┘
                                 │ HTTP (NEXT_PUBLIC_BACKEND_URL)
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  BACKEND (NestJS, port 3001)                                             │
│  - REST API: /parcels, /transfers, /admin/*, /my-parcels/:wallet, etc.   │
│  - MongoDB: parcels, transfer_requests, officers, whitelisted_wallets    │
│  - SolanaService: RPC connection, PDA helpers (parcel, transfer, officer)│
│  - Indexer: syncs chain → DB (parcels, transfers, officers, whitelist)│
└───────────────────────────────┬─────────────────────────────────────────┘
                                 │ RPC (SOLANA_RPC_URL)
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  SOLANA (local validator 8899 or devnet)                                │
│  - Programs: admin_registry, land_nft, transfer_approval                 │
│  - Backend indexer reads accounts and writes to MongoDB                  │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 1. Start Order (Required)

1. **MongoDB** – Running (local or Atlas). Backend needs `MONGO_URL` in `backend/.env`.
2. **Backend** – Start first so the frontend can reach the API.
3. **Frontend** – Start second. Uses `NEXT_PUBLIC_BACKEND_URL` (default `http://localhost:3001`).
4. **Solana (optional)** – For full on-chain workflow, run a local validator and deploy programs; backend indexer will sync. **Without Solana**, the app still works using **seed data** in MongoDB.

---

## 2. Environment Configuration

### Backend (`backend/.env`)

- Copy from `backend/.env.example`.
- **Required:** `MONGO_URL`, `PORT` (default 3001).
- **Solana (optional but recommended for indexer):**
  - `SOLANA_RPC_URL` – e.g. `http://localhost:8899` (local) or devnet RPC.
  - `ADMIN_REGISTRY_PROGRAM_ID`, `LAND_NFT_PROGRAM_ID`, `TRANSFER_APPROVAL_PROGRAM_ID` – use values from `Anchor.toml` for your cluster (localnet/devnet).

### Frontend (`frontend/.env.local`)

- **Required:** `NEXT_PUBLIC_BACKEND_URL=http://localhost:3001` (must match backend port).
- **Solana (for wallet + RPC):** `NEXT_PUBLIC_RPC_URL`, `NEXT_PUBLIC_SOLANA_CLUSTER`. Program IDs optional if frontend only talks to backend.

---

## 3. Data Flow by Feature

### Public Explorer (no wallet)

- **Frontend:** `GET /parcels` or `GET /parcels?search=...` via `parcelsApi.getAll()` / `parcelsApi.search()`.
- **Backend:** Reads from MongoDB (parcels table). Data comes from **seed** and/or **indexer** (Solana → DB).
- **Solana:** Not required for Explorer; backend can serve seed data only.

### Citizen Portal (wallet required)

- **Frontend:** User connects wallet → `parcelsApi.getByOwner(wallet)` → `GET /parcels?owner=...`, and `transfersApi.getBySeller(wallet)` → `GET /transfers?seller=...`.
- **Backend:** Same MongoDB parcels/transfers; optionally `GET /my-parcels/:wallet` (same data as `GET /parcels?owner=:wallet`).
- **Solana:** Wallet is used for connection/identity; ownership data is from backend DB (seed or indexer).

### Admin Panel (officer wallet)

- **Frontend:** Connect wallet → “Load Admin Data” → `adminApi.getOfficers()`, `adminApi.getWhitelistedWallets()`, `parcelsApi.getAll()`, `transfersApi.getPending()`.
- **Backend:** Serves from MongoDB (officers, whitelisted_wallets, parcels, transfer_requests). Indexer can sync these from chain.
- **Solana:** Optional; if RPC and programs are up, indexer keeps DB in sync with chain.

### Seed Data (no Solana needed)

- On backend start (non-production), **seed** runs and fills MongoDB with demo parcels, officers, whitelisted wallets, and transfer requests.
- If you see no data: call `GET http://localhost:3001/seed` once, then refresh the frontend.

---

## 4. Solana Integration (Backend)

- **SolanaService** – Connects to `SOLANA_RPC_URL`, holds program IDs, exposes PDA helpers and `getProgramAccounts`.
- **IndexerService** – On startup and every 60s, fetches program accounts (parcels, transfer requests, officers, whitelist) and upserts into MongoDB. If RPC is down, it skips sync and the app still works with existing/seed data.
- **Program IDs** – Must match deployed programs. Use `Anchor.toml` `[programs.localnet]` or `[programs.devnet]` and set the same in `backend/.env`.

---

## 5. Frontend ↔ Backend API Summary

| Frontend API call              | Backend route              | Purpose                    |
|-------------------------------|----------------------------|----------------------------|
| `parcelsApi.getAll()`         | `GET /parcels`             | All parcels                |
| `parcelsApi.getByOwner(w)`    | `GET /parcels?owner=w`     | Parcels owned by wallet    |
| `parcelsApi.getById(id)`      | `GET /parcels/:id`         | Single parcel              |
| `parcelsApi.search(q)`        | `GET /parcels?search=q`    | Search parcels             |
| `transfersApi.getBySeller(w)` | `GET /transfers?seller=w`  | Transfers where wallet is seller |
| `transfersApi.getPending()`   | `GET /pending-transfers`  | Pending transfers          |
| `adminApi.getOfficers()`      | `GET /admin/officers`      | All officers               |
| `adminApi.getWhitelistedWallets()` | `GET /admin/whitelist` | Whitelisted wallets        |
| Health check                  | `GET /health`              | Backend status             |

---

## 6. Quick Start Commands

```bash
# Terminal 1 – Backend
cd backend
npm install
# Ensure .env has MONGO_URL (and optional Solana vars)
npm run start:dev
# Wait for: "JaggaChain Backend running on http://localhost:3001"

# Terminal 2 – Frontend
cd frontend
npm install
# Ensure .env.local has NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue   # if you had ChunkLoadError
npm run dev
# Open http://localhost:3000
```

Optional: run Solana local validator and deploy programs (see Anchor docs); then backend indexer will sync chain → MongoDB.

---

## 7. Troubleshooting

- **ChunkLoadError / 404 on chunks** – Delete `frontend/.next` and run `npm run dev` again.
- **Backend disconnected** – Start backend first; ensure nothing else uses port 3001; check `NEXT_PUBLIC_BACKEND_URL`.
- **No parcels/transfers** – Run seed: `GET http://localhost:3001/seed`, then refresh.
- **Solana indexer not syncing** – Check `SOLANA_RPC_URL` and program IDs in `backend/.env`; ensure validator/programs are running if using localnet.

This is the **complete workflow** between frontend, backend, and Solana for JaggaChain.
