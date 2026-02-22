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
  if (!SOLANA_RPC || !KEYPAIR_B58) return false
  try {
    const { Connection, Keypair, Transaction, SystemProgram } = require('@solana/web3.js')
    const bs58 = require('bs58')
    connection = new Connection(SOLANA_RPC)
    keypair = Keypair.fromSecretKey(bs58.decode(KEYPAIR_B58))
    return true
  } catch (e) {
    console.warn('Solana init skipped:', e.message)
    return false
  }
}

const initialized = init()

const MEMO_PROGRAM_ID = 'MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr'

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

module.exports = {
  recordRegistration,
  recordTransfer,
  recordApprovalRejection,
  isConfigured: !!initialized
}
