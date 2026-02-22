# JaggaChain Setup Guide

## Prerequisites Installation

### 1. Install Rust

**Windows:**

1. Download and run the Rust installer from: https://rustup.rs/
2. Or run in PowerShell (as Administrator):
   ```powershell
   # Download and run installer
   Invoke-WebRequest -Uri https://win.rustup.rs/x86_64 -OutFile rustup-init.exe
   .\rustup-init.exe
   ```
3. Follow the installation prompts (defaults are usually fine)
4. Restart your terminal/PowerShell after installation
5. Verify installation:
   ```bash
   rustc --version
   cargo --version
   ```

### 2. Install Solana CLI

**Windows:**

1. Download Solana CLI from: https://github.com/solana-labs/solana/releases
2. Or use PowerShell:
   ```powershell
   # Download installer
   Invoke-WebRequest -Uri https://release.solana.com/stable/install -OutFile solana-install-init-x86_64-pc-windows-msvc.exe
   .\solana-install-init-x86_64-pc-windows-msvc.exe
   ```
3. Add Solana to PATH (usually done automatically)
4. Restart terminal and verify:
   ```bash
   solana --version
   solana-test-validator --version
   ```

### 3. Install Anchor CLI

After Rust is installed:

```bash
# Install Anchor Version Manager (avm)
cargo install --git https://github.com/coral-xyz/anchor avm --locked --force

# Install latest Anchor version
avm install latest
avm use latest

# Verify installation
anchor --version
```

**Alternative (if avm doesn't work):**

```bash
# Install Anchor directly via cargo
cargo install --git https://github.com/coral-xyz/anchor anchor-cli --locked
```

### 4. Install Node.js

1. Download from: https://nodejs.org/ (LTS version recommended)
2. Verify installation:
   ```bash
   node --version
   npm --version
   ```

### 5. Install PostgreSQL (for backend)

**Windows:**

1. Download from: https://www.postgresql.org/download/windows/
2. Or use Chocolatey:
   ```powershell
   choco install postgresql
   ```
3. Set up database:
   ```bash
   # Create database
   createdb jaggachain
   ```

## Quick Setup Checklist

- [ ] Rust installed (`cargo --version`)
- [ ] Solana CLI installed (`solana --version`)
- [ ] Anchor CLI installed (`anchor --version`)
- [ ] Node.js installed (`node --version`)
- [ ] PostgreSQL installed (optional for now, needed for backend)

## After Installation

1. **Restart your terminal/PowerShell** to ensure PATH variables are updated

2. **Configure Solana CLI:**
   ```bash
   solana config set --url localhost
   solana-keygen new  # Create a keypair for local development
   ```

3. **Verify everything works:**
   ```bash
   anchor --version
   solana --version
   cargo --version
   ```

## Troubleshooting

### Anchor not found after installation

1. Make sure you restarted your terminal
2. Check if `~/.cargo/bin` is in your PATH:
   ```powershell
   $env:PATH -split ';' | Select-String cargo
   ```
3. Add to PATH manually if needed:
   ```powershell
   [Environment]::SetEnvironmentVariable("Path", $env:Path + ";$env:USERPROFILE\.cargo\bin", "User")
   ```

### Solana not found

1. Check installation location (usually `%USERPROFILE%\.local\share\solana\install\active_release\bin`)
2. Add to PATH if not automatically added

### Rust not found

1. Run `rustup` to verify installation
2. Check PATH includes `%USERPROFILE%\.cargo\bin`

## Next Steps

Once all tools are installed:

1. **Build programs:**
   ```bash
   anchor build
   ```

2. **Deploy to localnet:**
   ```bash
   # Start validator (in separate terminal)
   solana-test-validator
   
   # Deploy (in main terminal)
   anchor deploy
   ```

3. **Run tests:**
   ```bash
   anchor test
   ```
