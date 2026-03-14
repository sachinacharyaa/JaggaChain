# Contributing to JaggaChain

Thank you for your interest in contributing to JaggaChain!  
This guide will help you get started.

---

## Getting Started

1. **Fork** the repository on GitHub.
2. **Clone** your fork locally:

   ```bash
   git clone https://github.com/<your-username>/JaggaChain.git
   cd JaggaChain
   ```

3. **Create a branch** for your feature or fix:

   ```bash
   git checkout -b feature/your-feature-name
   ```

---

## Development Setup

### Backend (Node.js / Express)

```bash
cd backend
npm install
npm start
```

The backend runs at `http://localhost:5000`.

### Frontend (React / Vite)

Open a new terminal from the project root:

```bash
cd frontend
npm install
npm run dev
```

The app runs at `http://localhost:5173`.  
Connect a Solana wallet (e.g. Phantom) on **devnet** to use Register, Transfer, and Government flows.

---

## Project Structure

- `frontend/` – React (Vite) frontend
- `backend/` – Node.js + Express API, MongoDB, Solana integration
- `SPEC.md` – Product/UI specification
- `README.md` – Project overview and quick start

---

## Making Changes

### Frontend Changes

- Follow existing patterns in `frontend/src/` (components, hooks, utils).
- Use Tailwind CSS utility classes for styling.
- Keep components small, readable, and focused.
- Test UI flows for:
  - Public Records
  - Portal (Register / My Parcels / Transfer)
  - Government (Officer / Admin)

### Backend Changes

- Follow existing patterns in `backend/server.js` and `backend/solana.js`.
- Keep controllers and data access logic simple and well-structured.
- Handle Solana RPC errors gracefully and log helpful messages.
- When changing fees, request statuses, or transaction flows, update:
  - API routes
  - MongoDB models (if needed)
  - Any affected frontend flows

---

## Commit Messages

Use clear, descriptive commit messages. Examples:

- `feat: add parcel search filters`
- `fix: handle missing Solana tx signature`
- `docs: update quick start section`
- `refactor: extract parcel card component`

---

## Pull Request Process

Before opening a Pull Request:

1. Ensure the **backend** and **frontend** both run without errors.
2. Run any available tests or linters (if configured in `package.json`).
3. Update documentation (`README.md`, `SPEC.md`) if you changed APIs or flows.
4. Write a clear PR description explaining **what** changed and **why**.
5. Link any related GitHub issues (if applicable).
6. Request a review.

---

## Code Style

- Follow the existing formatting and patterns in the codebase.
- Prefer:
  - Descriptive variable and function names.
  - Early returns for error cases.
  - Small, focused functions.
- If Prettier/ESLint configurations exist, run them before committing.

---

## Reporting Issues

If you find a bug or have a feature request:

1. Open an Issue on GitHub.
2. Include clear **steps to reproduce** (for bugs).
3. Mention:
   - Browser and OS (for frontend issues)
   - Wallet + network used (for Solana-related issues)
4. Add appropriate labels (`bug`, `feature`, `docs`, etc.) if you can.

---

## Questions?

If you have questions or ideas:

- Open a GitHub Discussion (if enabled), or
- Create an Issue with the `question` label.

Thank you for helping make JaggaChain better!

# Contributing to JaggaChain

Thank you for considering contributing to JaggaChain!

## How to contribute

1. Fork the repository.
2. Create a feature branch:
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. Commit your changes:
   ```bash
   git commit -m "Add amazing feature"
   ```
4. Push to your branch:
   ```bash
   git push origin feature/amazing-feature
   ```
5. Open a Pull Request against the `main` branch.
