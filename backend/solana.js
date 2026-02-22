/**
 * Solana on-chain recording for JaggaChain.
 * When SOLANA_RPC_URL and SOLANA_MINT_KEYPAIR (base58) are set, sends a memo transaction
 * so each registration/approval/transfer is recorded on Solana (signature visible on Explorer).
 * Without config, returns a dev placeholder signature.
 */

const SOLANA_RPC = process.env.SOLANA_RPC_URL || ''
const KEYPAIR_B58 = process.env.SOLANA_MINT_KEYPAIR || ''

let connection = null
let keypair = null

function init() {
  if (!SOLANA_RPC) return false
  try {
    const { Connection, Keypair, Transaction, SystemProgram } = require('@solana/web3.js')
    let bs58 = require('bs58')
    if (bs58.default) bs58 = bs58.default
    connection = new Connection(SOLANA_RPC)
    if (KEYPAIR_B58) keypair = Keypair.fromSecretKey(bs58.decode(KEYPAIR_B58))
    return true
  } catch (e) {
    console.warn('Solana init skipped:', e.message)
    return false
  }
}

const initialized = init()

const MEMO_PROGRAM_ID = 'MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr'

/** Build unsigned SPL transfer transaction for client to sign. */
async function buildNFTTransferTx(mintAddress, fromPubkey, toPubkey) {
  if (!connection || !SOLANA_RPC) throw new Error('Solana RPC not configured')
  const { Transaction, PublicKey } = require('@solana/web3.js')
  const spl = require('@solana/spl-token')
  const from = new PublicKey(fromPubkey)
  const to = new PublicKey(toPubkey)
  const mint = new PublicKey(mintAddress)

  const fromAta = await spl.getAssociatedTokenAddress(mint, from)
  const toAta = await spl.getAssociatedTokenAddress(mint, to)

  const tx = new Transaction().add(
    // Note: We assume the toAta exists or we'll need to create it.
    // For simplicity, let's include createIdempotent if needed, but client usually pays rent.
    spl.createAssociatedTokenAccountInstruction(
      from, // payer
      toAta,
      to,
      mint
    ),
    spl.createTransferInstruction(fromAta, toAta, from, 1)
  )

  const { blockhash } = await connection.getLatestBlockhash()
  tx.recentBlockhash = blockhash
  tx.feePayer = from
  const serialized = tx.serialize({ requireAllSignatures: false })
  return serialized.toString('base64')
}

/** Build registration transaction: fee transfer + memo record. */
async function buildRegistrationTx(fromPubkey, toPubkey, lamports, payload) {
  if (!connection || !SOLANA_RPC) throw new Error('Solana RPC not configured')
  const { Transaction, SystemProgram, PublicKey, TransactionInstruction } = require('@solana/web3.js')
  const from = new PublicKey(fromPubkey)
  const to = new PublicKey(toPubkey)

  const tx = new Transaction()

  // 1. Fee transfer
  tx.add(SystemProgram.transfer({ fromPubkey: from, toPubkey: to, lamports: Number(lamports) }))

  // 2. Memo recording
  const text = `JaggaChain:REGISTRATION_REQUEST:${payload.ownerName}:${payload.district}:${payload.municipality}:${payload.ward}:${payload.tole}`
  tx.add(new TransactionInstruction({
    keys: [],
    programId: new PublicKey(MEMO_PROGRAM_ID),
    data: Buffer.from(text, 'utf8')
  }))

  const { blockhash } = await connection.getLatestBlockhash()
  tx.recentBlockhash = blockhash
  tx.feePayer = from
  const serialized = tx.serialize({ requireAllSignatures: false })
  return serialized.toString('base64')
}

/** Build unsigned fee-transfer transaction for client to sign. Returns base64 serialized tx. */
async function buildFeeTransferTx(fromPubkey, toPubkey, lamports) {
  if (!connection || !SOLANA_RPC) throw new Error('Solana RPC not configured')
  const { Transaction, SystemProgram, PublicKey } = require('@solana/web3.js')
  const from = typeof fromPubkey === 'string' ? new PublicKey(fromPubkey) : fromPubkey
  const to = typeof toPubkey === 'string' ? new PublicKey(toPubkey) : toPubkey
  const tx = new Transaction().add(
    SystemProgram.transfer({ fromPubkey: from, toPubkey: to, lamports: Number(lamports) })
  )
  const { blockhash } = await connection.getLatestBlockhash()
  tx.recentBlockhash = blockhash
  tx.feePayer = from
  const serialized = tx.serialize({ requireAllSignatures: false })
  return serialized.toString('base64')
}

/** Submit a signed transaction (base64) and return signature. */
async function submitSignedTx(signedTxBase64) {
  if (!connection) throw new Error('Solana RPC not configured')
  const buffer = Buffer.from(signedTxBase64, 'base64')
  const sig = await connection.sendRawTransaction(buffer, { skipPreflight: false })
  await connection.confirmTransaction(sig)
  return sig
}

async function sendMemo(text) {
  if (!initialized || !connection || !keypair) {
    return 'dev-' + Date.now() + '-' + Math.random().toString(36).slice(2, 12)
  }
  try {
    const { Transaction, PublicKey, TransactionInstruction } = require('@solana/web3.js')
    const tx = new Transaction()
    const memoIx = new TransactionInstruction({
      keys: [],
      programId: new PublicKey(MEMO_PROGRAM_ID),
      data: Buffer.from(text, 'utf8')
    })
    tx.add(memoIx)
    const { blockhash } = await connection.getLatestBlockhash()
    tx.recentBlockhash = blockhash
    tx.feePayer = keypair.publicKey
    const sig = await connection.sendTransaction(tx, [keypair], { skipPreflight: false })
    await connection.confirmTransaction(sig)
    return sig
  } catch (e) {
    console.error('Solana memo failed:', e.message)
    return 'dev-' + Date.now() + '-' + Math.random().toString(36).slice(2, 12)
  }
}

async function recordRegistration(payload) {
  const text = `JaggaChain:REGISTRATION:${payload.tokenId}:${payload.ownerWallet}:${payload.ownerName}:${payload.district}:${payload.municipality}`
  return sendMemo(text)
}

async function recordTransfer(payload) {
  const text = `JaggaChain:TRANSFER:${payload.parcelId}:${payload.fromWallet}:${payload.toWallet}:${payload.toName}`
  return sendMemo(text)
}

async function recordApprovalRejection(type, requestId, status) {
  const text = `JaggaChain:${type}:${requestId}:${status}`
  return sendMemo(text)
}

/** Mint parcel NFT (SPL token, 0 decimals) to owner wallet. Returns { mintAddress, signature }. */
async function mintParcelNFT(ownerWallet, tokenId, ownerName, district, municipality) {
  if (!connection || !keypair) {
    return { mintAddress: null, signature: 'dev-mint-' + Date.now() }
  }
  try {
    const { Keypair, PublicKey } = require('@solana/web3.js')
    const spl = require('@solana/spl-token')
    const mintKeypair = Keypair.generate()
    const ownerPk = new PublicKey(ownerWallet)
    const mintAddress = await spl.createMint(
      connection,
      keypair,
      keypair.publicKey,
      null,
      0,
      mintKeypair
    )
    const ata = await spl.getOrCreateAssociatedTokenAccount(
      connection,
      keypair,
      mintAddress,
      ownerPk
    )
    const sig = await spl.mintTo(
      connection,
      keypair,
      mintAddress,
      ata.address,
      keypair,
      1
    )
    return { mintAddress: mintAddress.toBase58(), signature: sig }
  } catch (e) {
    console.error('Parcel NFT mint failed:', e.message)
    return { mintAddress: null, signature: 'dev-mint-' + Date.now() }
  }
}

/** Transfer parcel NFT from one wallet to another. Returns signature. */
async function transferParcelNFT(mintAddress, fromWallet, toWallet) {
  if (!connection || !keypair) {
    return 'dev-transfer-' + Date.now()
  }
  try {
    const { PublicKey } = require('@solana/web3.js')
    const spl = require('@solana/spl-token')
    const mintPk = new PublicKey(mintAddress)
    const fromPk = new PublicKey(fromWallet)
    const toPk = new PublicKey(toWallet)

    // Get ATAs
    const fromAta = await spl.getOrCreateAssociatedTokenAccount(
      connection,
      keypair,
      mintPk,
      fromPk
    )
    const toAta = await spl.getOrCreateAssociatedTokenAccount(
      connection,
      keypair,
      mintPk,
      toPk
    )

    // Transfer (requires fromWallet to have delegated to keypair OR keypair to be the owner)
    // In our system, the government keypair (keypair) will be the one signing.
    // We assume the government can move it because it's the authority OR it's holding it in escrow.
    const sig = await spl.transfer(
      connection,
      keypair,
      fromAta.address,
      toAta.address,
      keypair, // Owner/Delegate signing
      1
    )
    return sig
  } catch (e) {
    console.error('Parcel NFT transfer failed:', e.message)
    return 'dev-transfer-' + Date.now()
  }
}

/** Get the public key of the protocol/government keypair. */
async function getProtocolPublicKey() {
  return keypair ? keypair.publicKey.toBase58() : null
}

module.exports = {
  recordRegistration,
  recordTransfer,
  recordApprovalRejection,
  buildFeeTransferTx,
  buildRegistrationTx,
  buildNFTTransferTx,
  submitSignedTx,
  mintParcelNFT,
  transferParcelNFT,
  getProtocolPublicKey,
  isConfigured: !!initialized
}
