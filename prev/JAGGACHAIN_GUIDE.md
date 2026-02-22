# JaggaChain - Complete User Guide
## नेपालको भूमि रजिस्ट्री | Nepal Land Registry System

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [For Public Users](#for-public-users)
3. [For Citizens (Land Owners)](#for-citizens-land-owners)
4. [For Government Officers](#for-government-officers)
5. [System Architecture](#system-architecture)
6. [Getting Started](#getting-started)

---

## 🌟 Overview

**JaggaChain** is a blockchain-powered land registry system for Nepal built on Solana. It provides:

- ✅ **Transparent** land ownership records on-chain
- ✅ **Secure** blockchain-based storage
- ✅ **Government-controlled** transfers with approval workflow
- ✅ **Public access** to verify land ownership
- ✅ **NFT-based** land parcels (1 parcel = 1 NFT)

### Key Features

- **Public Explorer**: Anyone can search and view land parcels
- **Citizen Portal**: Land owners can manage their properties
- **Admin Panel**: Government officers can mint parcels and approve transfers
- **Blockchain Security**: All records stored on Solana blockchain
- **MongoDB Backend**: Fast querying and indexing

---

## 👥 For Public Users

### What Can You Do?

As a public user (no login required), you can:

1. **Search Land Parcels**
   - Visit the **Explorer** page
   - Search by:
     - Parcel ID (e.g., `KTM-001-100`)
     - Location (e.g., "Kathmandu Ward 1")
     - Owner name (e.g., "Ram Bahadur Shrestha")

2. **View Parcel Details**
   - Click on any parcel to see:
     - Owner information
     - Location and area
     - Ownership history
     - Transfer records
     - Current status (Active/Frozen)

3. **Verify Ownership**
   - Check if a parcel is legitimately owned
   - View transfer history
   - See government approval records

### Step-by-Step Guide

#### Step 1: Access the Explorer
1. Go to **http://localhost:3000**
2. Click **"Explore Parcels"** or navigate to `/explorer`

#### Step 2: Search for Parcels
1. Use the search bar at the top
2. Type any search term:
   - Parcel ID: `KTM-001-100`
   - Location: `Kathmandu`
   - Owner: `Ram Bahadur`

#### Step 3: View Details
1. Click on any parcel card
2. View complete information:
   - Owner name and wallet address
   - Location and area
   - Mint date
   - Transfer history
   - Survey documents (if available)

---

## 👤 For Citizens (Land Owners)

### What Can You Do?

As a citizen with a connected Solana wallet, you can:

1. **View Your Parcels**
   - See all land parcels you own
   - Check parcel status and details

2. **View Transfer Requests**
   - See pending transfer requests where you're the seller
   - Track transfer status (Pending/Approved/Rejected/Executed)

3. **Request Transfers** (Coming Soon)
   - Initiate land transfer to another citizen
   - Upload required documents

### Prerequisites

- **Solana Wallet**: You need a Solana wallet (Phantom, Solflare, etc.)
- **Whitelisted Wallet**: Your wallet must be whitelisted by a government officer

### Step-by-Step Guide

#### Step 1: Connect Your Wallet
1. Go to **http://localhost:3000**
2. Click **"Connect Wallet"** button (top right)
3. Select your wallet provider (Phantom, Solflare, etc.)
4. Approve the connection

#### Step 2: Access Citizen Portal
1. Click **"Citizen Portal"** or navigate to `/citizen`
2. You'll see:
   - **Owned Parcels**: All parcels registered to your wallet
   - **Transfer Requests**: All transfers where you're the seller

#### Step 3: View Your Parcels
1. Scroll to **"My Parcels"** section
2. Click on any parcel to view full details
3. Check status indicators:
   - 🟢 **Active**: Parcel is active and transferable
   - 🔴 **Frozen**: Parcel is frozen (cannot be transferred)

#### Step 4: Monitor Transfer Requests
1. Scroll to **"Transfer Requests"** section
2. View status of each transfer:
   - 🟡 **Pending**: Waiting for buyer acceptance or government approval
   - 🔵 **Approved**: Government approved, ready to execute
   - 🟢 **Executed**: Transfer completed successfully
   - 🔴 **Rejected**: Transfer was rejected by government

---

## 🏛️ For Government Officers

### What Can You Do?

As a government officer with admin access, you can:

1. **View Officers**
   - See all registered officers
   - Check officer roles and status

2. **Manage Whitelisted Wallets**
   - View all whitelisted citizen wallets
   - Verify wallet eligibility

3. **Mint Parcels** (Coming Soon - Program Integration)
   - Create new land parcel NFTs
   - Register parcels to citizens

4. **Approve Transfers** (Coming Soon - Program Integration)
   - Review transfer requests
   - Approve or reject transfers
   - Execute approved transfers

### Officer Roles

- **SuperAdmin**: Full access to all functions
- **MintOfficer**: Can mint new parcels
- **TransferOfficer**: Can approve/reject transfers

### Prerequisites

- **Authorized Wallet**: Your wallet must be registered as an officer
- **Officer Role**: You must have the appropriate role for the action

### Step-by-Step Guide

#### Step 1: Connect Your Officer Wallet
1. Go to **http://localhost:3000**
2. Connect your wallet (must be registered as an officer)
3. Navigate to **"Admin Panel"** or `/admin`

#### Step 2: View Admin Data
1. Click **"Load Admin Data"** button
2. View:
   - **Officers**: All registered officers with roles
   - **Whitelisted Wallets**: All approved citizen wallets

#### Step 3: Manage Officers
1. View officer list:
   - Officer wallet address
   - Role (SuperAdmin/MintOfficer/TransferOfficer)
   - Status (Active/Inactive)

#### Step 4: Manage Whitelisted Wallets
1. View all whitelisted wallets
2. Verify wallet addresses
3. Check whitelist status

#### Step 5: Admin Functions (Program Integration Required)
Once Solana program integration is complete, you'll be able to:

1. **Mint Parcel NFT**:
   - Enter parcel details (ID, owner, location, area)
   - Upload survey documents
   - Mint NFT to citizen wallet

2. **Approve Transfer**:
   - Review transfer request details
   - Verify buyer is whitelisted
   - Approve or reject transfer

3. **Execute Transfer**:
   - Execute approved transfers
   - Transfer NFT from seller to buyer
   - Update ownership records

---

## 🏗️ System Architecture

### Frontend (React + TypeScript + Next.js)
- **Location**: `frontend/`
- **Framework**: Next.js 14
- **UI Library**: React 18
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Wallet**: Solana Wallet Adapter

### Backend (Node.js + TypeScript + NestJS)
- **Location**: `backend/`
- **Framework**: NestJS
- **Database**: MongoDB (Atlas)
- **ORM**: TypeORM
- **API**: REST API

### Blockchain (Solana)
- **Network**: Solana (localnet/devnet/mainnet)
- **Programs**: 
  - Admin Registry
  - Land NFT
  - Transfer Approval
- **Framework**: Anchor

### Data Flow

```
┌─────────────┐
│   Frontend  │ (React/Next.js)
│  localhost:3000 │
└──────┬──────┘
       │ HTTP/REST
       ▼
┌─────────────┐
│   Backend   │ (NestJS)
│ localhost:3001 │
└──────┬──────┘
       │
       ├──► MongoDB (Data Storage)
       │
       └──► Solana RPC (Blockchain)
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (Atlas or local)
- Solana CLI (optional, for localnet)

### Running the Project

#### 1. Start Backend

```bash
cd backend
npm install
npm run start:dev
```

Backend will:
- Connect to MongoDB
- Seed dummy data (in development mode)
- Start API server on `http://localhost:3001`

#### 2. Start Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend will:
- Start Next.js dev server
- Available at `http://localhost:3000`

#### 3. Access the Application

- **Public Explorer**: http://localhost:3000/explorer
- **Citizen Portal**: http://localhost:3000/citizen (requires wallet)
- **Admin Panel**: http://localhost:3000/admin (requires officer wallet)

### Demo Data

The system automatically seeds dummy data in development mode:

- **10 Parcels**: Various locations in Nepal
- **5 Whitelisted Wallets**: For citizen access
- **3 Officers**: Different roles
- **4 Transfer Requests**: Various statuses

### Sample Parcel IDs

- `KTM-001-100`
- `KTM-002-101`
- `KTM-003-102`
- ... (up to `KTM-010-109`)

### Sample Search Terms

- **Location**: "Kathmandu", "Pokhara", "Lalitpur"
- **Owner**: "Ram Bahadur", "Sita Devi", "Krishna Prasad"
- **Parcel ID**: "KTM-001", "KTM-002"

---

## 🔐 Security & Privacy

### Public Data
- Parcel IDs
- Owner names
- Locations
- Transfer history
- All visible in Explorer

### Private Data
- Wallet private keys (never stored)
- Personal documents (stored on IPFS)
- Government officer credentials

### Blockchain Security
- All ownership records on Solana blockchain
- Immutable transaction history
- Government approval required for transfers

---

## 📞 Support

For issues or questions:
1. Check this guide
2. Review API documentation at `/api` endpoints
3. Check backend logs for errors

---

## 🎯 Next Steps

1. **Connect Solana Programs**: Full integration with on-chain programs
2. **IPFS Integration**: Upload survey documents
3. **Real-time Updates**: WebSocket for live transaction updates
4. **Mobile App**: React Native app for mobile access

---

**Built with ❤️ for Nepal | नेपालको लागि बनाइएको**
