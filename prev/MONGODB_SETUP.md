# MongoDB setup (JaggaChain)

The app uses **only two collections** in the `jaggaChain` database:

- **`parcels`** – land parcels (owner, location, etc.)
- **`transfers`** – transfer requests (seller, buyer, status)

The **`officers`** and **`whitelisted_wallets`** collections are **not used**. It’s normal for them to be empty. Ignore them.

## 1. Set connection string

In **`backend/.env`** set your MongoDB URL, e.g. Atlas:

```env
MONGO_URL=mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/jaggaChain
```

## 2. Start backend

```bash
cd backend
npm run start:dev
```

Wait until you see: `JaggaChain Backend running on http://localhost:3001`

## 3. Load demo data (one time)

- **Option A:** In the app, go to **Explorer** or **My Parcels**. If you see “No parcels”, click **“Load demo data”** (or **“Load demo data into MongoDB”**).
- **Option B:** Open in the browser: **http://localhost:3001/ensure-dummy**

You should see something like: `ok: true`, `parcelsInserted: 5`, `transfersInserted: 2`.

## 4. Check in MongoDB Compass

- Open database **jaggaChain**.
- Look at the **`parcels`** and **`transfers`** collections (not `officers`).
- After loading demo data, **parcels** should have 5 documents and **transfers** 2.

## 5. See data in the app

- **Explorer:** You should see 5 parcels; no wallet needed.
- **My Parcels:** Connect the wallet **G6DKYcQnySUk1ZYYuR1HMovVscWjAtyDQb6GhqrvJYnw** (Sachin). You should see 3 parcels and 1 transfer request.

If “Load demo data” fails, check the **backend terminal** for the error (e.g. wrong `MONGO_URL` or Atlas network access).
