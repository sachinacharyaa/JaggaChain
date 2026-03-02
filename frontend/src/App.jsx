import { useState, useEffect, useMemo } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { Transaction, LAMPORTS_PER_SOL } from '@solana/web3.js'
import {
  Search,
  MapPin,
  Landmark,
  FileCheck,
  Shield,
  Zap,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Mountain,
  FileWarning,
  Lock,
  CheckCircle2,
  XCircle,
  Loader2,
  LayoutDashboard,
  Globe,
  User,
  Github,
  Mail,
} from 'lucide-react'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000'
// Assigned wallets – exactly one role per wallet (CLRO checked first so one wallet = one role)
// Wallet A Citizen (नागरिक) Sachin Acharya
const WALLET_CITIZEN = 'G6DKYcQnySUk1ZYYuR1HMovVscWjAtyDQb6GhqrvJYnw'
// Wallet B Land Revenue Officer (मालपोत अधिकृत) Hari Prasad Shah
const WALLET_LRO = (import.meta.env.VITE_WALLET_LRO || 'sDHAt4Sfn556SXvKddXjCwAeKaMpLHEKKWcfG7hfmoz').trim()
// Wallet C Chief Land Revenue Officer (प्रमुख मालपोत अधिकृत) Gagan Sher Shah
const WALLET_CLRO = (import.meta.env.VITE_WALLET_CLRO || '8b29vHx8ZdAQp9vNSLSgmNxeqgPZbyqE6paPdwVvXYSB').trim()

const NepalFlag = () => (
  <svg viewBox="0 0 25 21" className="flag-wave h-9 w-auto" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <clipPath id="flag-clip">
        <rect width="25" height="21" rx="2" />
      </clipPath>
    </defs>
    <g clipPath="url(#flag-clip)">
      <rect width="25" height="21" fill="#DC2626" />
      <path d="M12.5 2.5L14.5 8.5H20.5L15.5 12.5L17.5 18.5L12.5 14.5L7.5 18.5L9.5 12.5L4.5 8.5H10.5L12.5 2.5Z" fill="#003893" />
      <path d="M12.5 5L13.5 8.5H16.5L14 10.5L15 14L12.5 11.5L10 14L11 10.5L8.5 8.5H11.5L12.5 5Z" fill="#003893" />
    </g>
  </svg>
)

const JaggaChainLogo = ({ className = '', showSubtitle = false }) => (
  <div className={`flex flex-col leading-tight ${className}`}>
    <span className="jaggachain-wordmark text-2xl tracking-[0.05em]">
      JaggaChain
    </span>
    {showSubtitle && (
      <span className="font-mono text-[10px] tracking-[0.3em] uppercase bg-gradient-to-r from-[#9945FF] to-[#14F195] bg-clip-text text-transparent -mt-1">
        Built on Solana
      </span>
    )}
  </div>
)

// Nepal 7 provinces (2015 constitution)
const NEPAL_PROVINCES = [
  'Koshi',
  'Madhesh',
  'Bagmati',
  'Gandaki',
  'Lumbini',
  'Karnali',
  'Sudurpashchim'
]

// Districts by province (77 districts)
const NEPAL_DISTRICTS_BY_PROVINCE = {
  Koshi: ['Bhojpur', 'Dhankuta', 'Ilam', 'Jhapa', 'Khotang', 'Morang', 'Okhaldhunga', 'Panchthar', 'Sankhuwasabha', 'Solukhumbu', 'Sunsari', 'Taplejung', 'Tehrathum', 'Udayapur'],
  Madhesh: ['Parsa', 'Bara', 'Rautahat', 'Sarlahi', 'Mahottari', 'Dhanusha', 'Siraha', 'Saptari'],
  Bagmati: ['Sindhuli', 'Ramechhap', 'Dolakha', 'Bhaktapur', 'Dhading', 'Kathmandu', 'Kavrepalanchok', 'Lalitpur', 'Nuwakot', 'Rasuwa', 'Sindhupalchok', 'Chitwan', 'Makwanpur'],
  Gandaki: ['Baglung', 'Gorkha', 'Kaski', 'Lamjung', 'Manang', 'Mustang', 'Myagdi', 'Nawalpur', 'Parbat', 'Syangja', 'Tanahun'],
  Lumbini: ['Kapilvastu', 'Parasi', 'Rupandehi', 'Arghakhanchi', 'Gulmi', 'Palpa', 'Dang', 'Pyuthan', 'Rolpa', 'Eastern Rukum', 'Banke', 'Bardiya'],
  Karnali: ['Western Rukum', 'Salyan', 'Dolpa', 'Humla', 'Jumla', 'Kalikot', 'Mugu', 'Surkhet', 'Dailekh', 'Jajarkot'],
  Sudurpashchim: ['Kailali', 'Achham', 'Doti', 'Bajhang', 'Bajura', 'Kanchanpur', 'Dadeldhura', 'Baitadi', 'Darchula']
}

function App() {
  const { publicKey, connected, signTransaction } = useWallet()
  const walletAddress = publicKey?.toBase58() || null
  // One role per wallet: CLRO first, then LRO, then Citizen (so env mix-up can't show wrong role)
  const isCLRO = useMemo(() => Boolean(walletAddress && walletAddress === WALLET_CLRO), [walletAddress])
  const isLRO = useMemo(() => Boolean(walletAddress && walletAddress === WALLET_LRO && !isCLRO), [walletAddress, isCLRO])
  const isCitizen = useMemo(() => Boolean(walletAddress && !isCLRO && !isLRO), [walletAddress, isCLRO, isLRO])

  const [feeConfig, setFeeConfig] = useState({
    citizenFeeSol: 0.02,
    lroFeeSol: 0.05,
    clroFeeSol: 0.08,
    treasuryWallet: '',
    solanaConfigured: true
  })

  const [activeTab, setActiveTab] = useState('landing')
  const [parcels, setParcels] = useState([])
  const [whitelist, setWhitelist] = useState([])
  const [stats, setStats] = useState({ totalParcels: 0, pendingRegistrations: 0, pendingTransfers: 0 })
  const [searchQuery, setSearchQuery] = useState('')
  const [searched, setSearched] = useState(false)
  const [showRegisterModal, setShowRegisterModal] = useState(false)
  const [showTransferModal, setShowTransferModal] = useState(false)
  const [selectedParcelDetail, setSelectedParcelDetail] = useState(null)
  const [parcelRegistrationProof, setParcelRegistrationProof] = useState(null)
  const [txLoading, setTxLoading] = useState(null)
  const [expandedRequestId, setExpandedRequestId] = useState(null)
  const [registerForm, setRegisterForm] = useState({
    ownerName: '',
    province: '',
    district: '',
    municipality: '',
    ward: '',
    tole: '',
    bigha: '',
    kattha: '',
    dhur: '',
  })
  const [districtSearch, setDistrictSearch] = useState('')
  const [districtDropdownOpen, setDistrictDropdownOpen] = useState(false)
  const [transferForm, setTransferForm] = useState({
    parcelId: '',
    toWallet: '',
    toName: '',
  })
  const [notification, setNotification] = useState({ message: null, type: 'success' })

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type })
    setTimeout(() => setNotification((n) => (n.message === message ? { message: null, type: 'success' } : n)), 5000)
  }

  useEffect(() => {
    fetchStats()
    fetch(`${API_BASE}/api/fee-config`)
      .then((r) => r.json())
      .then((d) => setFeeConfig({
        citizenFeeSol: d.citizenFeeSol ?? 0.02,
        lroFeeSol: d.lroFeeSol ?? 0.05,
        clroFeeSol: d.clroFeeSol ?? 0.08,
        treasuryWallet: d.treasuryWallet || '',
        solanaConfigured: d.solanaConfigured !== false
      }))
      .catch(() => { })
  }, [])

  /** Pay SOL fee via backend-built tx: no frontend RPC needed. User signs in wallet; backend submits. Returns signature as proof. */
  const payFeeSol = async (amountSol) => {
    if (!publicKey) throw new Error('Connect your wallet first.')
    if (!signTransaction) throw new Error('Your wallet does not support signing. Try Phantom or Solflare.')
    const toPubkey = feeConfig.treasuryWallet || publicKey.toBase58()
    const lamports = Math.floor(amountSol * LAMPORTS_PER_SOL)
    const buildRes = await fetch(`${API_BASE}/api/solana/build-fee-tx`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fromPubkey: publicKey.toBase58(),
        toPubkey,
        lamports
      })
    })
    if (!buildRes.ok) {
      const text = await buildRes.text()
      let errMsg = 'Failed to build fee transaction'
      try {
        const data = JSON.parse(text)
        if (data.error) errMsg = data.error
      } catch (_) {
        if (text) errMsg = text.slice(0, 200)
      }
      throw new Error(errMsg)
    }
    const { transaction: txBase64 } = await buildRes.json()
    const buf = Uint8Array.from(atob(txBase64), c => c.charCodeAt(0))
    const tx = Transaction.from(buf)
    const signed = await signTransaction(tx)
    const serialized = signed.serialize()
    const bytes = new Uint8Array(serialized)
    let binary = ''
    for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i])
    const signedB64 = btoa(binary)
    const submitRes = await fetch(`${API_BASE}/api/solana/submit-signed-tx`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ signedTransaction: signedB64 })
    })
    if (!submitRes.ok) {
      const data = await submitRes.json().catch(() => ({}))
      throw new Error(data.error || 'Failed to submit transaction')
    }
    const { signature } = await submitRes.json()
    return signature
  }

  /** Pay registration fee and record details in one tx. Wallet will open to confirm — that's your Solana proof. */
  const payRegistrationTx = async (lamports, payload) => {
    if (!connected || !publicKey) throw new Error('Connect your wallet first.')
    const toPubkey = feeConfig.treasuryWallet || publicKey.toBase58()

    const buildRes = await fetch(`${API_BASE}/api/solana/build-registration-tx`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fromPubkey: publicKey.toBase58(),
        toPubkey,
        lamports,
        payload
      })
    })
    if (!buildRes.ok) {
      const data = await buildRes.json().catch(() => ({}))
      throw new Error(data.error || 'Failed to build registration tx')
    }
    const { transaction: txBase64 } = await buildRes.json()

    // 2. Sign and submit
    const buf = Uint8Array.from(atob(txBase64), c => c.charCodeAt(0))
    const tx = Transaction.from(buf)
    const signed = await signTransaction(tx)

    const serialized = signed.serialize()
    const bytes = new Uint8Array(serialized)
    let binary = ''
    for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i])
    const signedB64 = btoa(binary)

    const submitRes = await fetch(`${API_BASE}/api/solana/submit-signed-tx`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ signedTransaction: signedB64 })
    })
    if (!submitRes.ok) {
      const data = await submitRes.json().catch(() => ({}))
      throw new Error(data.error || 'Failed to submit registration tx')
    }
    const { signature } = await submitRes.json()
    return signature
  }

  const paymentErrorMessage = (err) => err?.message || 'Action failed. Ensure you have enough SOL and try again.'

  /** Move NFT to treasury escrow. Wallet will open to confirm. */
  const payNftTransfer = async (mintAddress) => {
    if (!connected || !publicKey) throw new Error('Connect your wallet first.')
    const toPubkey = feeConfig.treasuryWallet || publicKey.toBase58()

    const buildRes = await fetch(`${API_BASE}/api/solana/build-nft-transfer-tx`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mintAddress,
        fromPubkey: publicKey.toBase58(),
        toPubkey
      })
    })
    if (!buildRes.ok) {
      const data = await buildRes.json().catch(() => ({}))
      throw new Error(data.error || 'Failed to build NFT transfer')
    }
    const { transaction: txBase64 } = await buildRes.json()

    // 2. Sign and submit
    const buf = Uint8Array.from(atob(txBase64), c => c.charCodeAt(0))
    const tx = Transaction.from(buf)
    const signed = await signTransaction(tx)

    const serialized = signed.serialize()
    const bytes = new Uint8Array(serialized)
    let binary = ''
    for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i])
    const signedB64 = btoa(binary)

    const submitRes = await fetch(`${API_BASE}/api/solana/submit-signed-tx`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ signedTransaction: signedB64 })
    })
    if (!submitRes.ok) {
      const data = await submitRes.json().catch(() => ({}))
      throw new Error(data.error || 'Failed to submit NFT transfer')
    }
    const { signature } = await submitRes.json()
    return signature
  }

  useEffect(() => {
    if (connected && walletAddress) {
      if (isLRO || isCLRO) fetchWhitelist()
      if (isCitizen) {
        fetchParcelsByOwner(walletAddress)
        fetchWhitelist()
      }
    }
  }, [connected, walletAddress, isLRO, isCLRO, isCitizen])

  useEffect(() => {
    if (!selectedParcelDetail?._id) {
      setParcelRegistrationProof(null)
      return
    }
    let cancelled = false
    fetch(`${API_BASE}/api/parcels/${selectedParcelDetail._id}/registration-proof`)
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) setParcelRegistrationProof(data)
      })
      .catch(() => { if (!cancelled) setParcelRegistrationProof(null) })
    return () => { cancelled = true }
  }, [selectedParcelDetail?._id])

  const fetchParcels = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/parcels`)
      const data = await res.json()
      setParcels(data)
    } catch (err) {
      console.error('Failed to fetch parcels:', err)
    }
  }

  const fetchParcelsByOwner = async (wallet) => {
    try {
      const res = await fetch(`${API_BASE}/api/parcels/owner/${encodeURIComponent(wallet)}`)
      const data = await res.json()
      setParcels(data)
    } catch (err) {
      console.error('Failed to fetch parcels:', err)
    }
  }

  const searchParcels = async (query) => {
    setSearchQuery(query)
    if (!query.trim()) {
      setSearched(false)
      setParcels([])
      return
    }
    setSearched(true)
    try {
      const res = await fetch(`${API_BASE}/api/parcels/search?q=${encodeURIComponent(query)}`)
      const data = await res.json()
      setParcels(data)
    } catch (err) {
      console.error('Failed to search parcels:', err)
    }
  }

  const fetchWhitelist = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/whitelist`)
      const data = await res.json()
      setWhitelist(data)
    } catch (err) {
      console.error('Failed to fetch whitelist:', err)
    }
  }

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/stats`)
      const data = await res.json()
      setStats(data)
    } catch (err) {
      console.error('Failed to fetch stats:', err)
    }
  }

  // Chief Land Revenue Officer: approve or reject (0.08 SOL)
  const handleWhitelistAction = async (id, status) => {
    setTxLoading(id)
    try {
      const paymentTxSignature = await payFeeSol(feeConfig.clroFeeSol)
      const res = await fetch(`${API_BASE}/api/whitelist/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, paymentTxSignature }),
      })
      if (res.ok) {
        await fetchWhitelist()
        await fetchStats()
        if (walletAddress && isCitizen) fetchParcelsByOwner(walletAddress)
        showNotification(status === 'approved' ? 'Request approved. Recorded on Solana.' : 'Request rejected. Recorded on Solana.', 'success')
      } else {
        const data = await res.json().catch(() => ({}))
        showNotification(data.error || 'Action failed', 'error')
      }
    } catch (err) {
      console.error('Failed to update whitelist:', err)
      showNotification(paymentErrorMessage(err), 'error')
    }
    setTxLoading(null)
  }

  // Land Revenue Officer: propose (0.05 SOL) – moves pending → proposed
  const handlePropose = async (id) => {
    setTxLoading(id)
    try {
      const paymentTxSignature = await payFeeSol(feeConfig.lroFeeSol)
      const res = await fetch(`${API_BASE}/api/whitelist/${id}/propose`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentTxSignature }),
      })
      if (res.ok) {
        await fetchWhitelist()
        await fetchStats()
        showNotification('Proposal submitted. Record forwarded to Chief Land Revenue Officer.', 'success')
      } else {
        const data = await res.json().catch(() => ({}))
        showNotification(data.error || 'Proposal failed', 'error')
      }
    } catch (err) {
      console.error('Failed to propose:', err)
      showNotification(paymentErrorMessage(err), 'error')
    }
    setTxLoading(null)
  }

  const handleRegistration = async (e) => {
    e.preventDefault()
    if (!walletAddress) return
    if (registerForm.province && !registerForm.district) {
      showNotification('Please select a district from the list.', 'error')
      return
    }
    if (registerForm.province && NEPAL_DISTRICTS_BY_PROVINCE[registerForm.province] && !NEPAL_DISTRICTS_BY_PROVINCE[registerForm.province].includes(registerForm.district)) {
      showNotification('Please select a valid district for the chosen province.', 'error')
      return
    }
    setTxLoading('registering')
    try {
      const payload = {
        ownerName: registerForm.ownerName,
        province: registerForm.province,
        district: registerForm.district,
        municipality: registerForm.municipality,
        ward: registerForm.ward,
        tole: registerForm.tole,
      }

      const paymentTxSignature = await payRegistrationTx(feeConfig.citizenFeeSol * LAMPORTS_PER_SOL, payload)

      await fetch(`${API_BASE}/api/whitelist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress,
          ownerName: registerForm.ownerName,
          requestType: 'registration',
          location: {
            province: registerForm.province,
            district: registerForm.district,
            municipality: registerForm.municipality,
            ward: registerForm.ward,
            tole: registerForm.tole,
          },
          size: {
            bigha: registerForm.bigha,
            kattha: registerForm.kattha,
            dhur: registerForm.dhur,
          },
          paymentTxSignature,
        }),
      })
      await fetchWhitelist()
      setShowRegisterModal(false)
      setRegisterForm({ ownerName: '', province: '', district: '', municipality: '', ward: '', tole: '', bigha: '', kattha: '', dhur: '' })
      setDistrictSearch('')
      setDistrictDropdownOpen(false)
      showNotification('Registration submitted. Pending government approval. You will see it in My requests and in Active once approved.', 'success')
    } catch (err) {
      console.error('Failed to submit registration:', err)
      showNotification(paymentErrorMessage(err), 'error')
    }
    setTxLoading(null)
  }
  const handleTransfer = async (e) => {
    e.preventDefault()
    if (!walletAddress) return
    setTxLoading('transferring')
    try {
      const parcel = myParcels.find(p => p._id === transferForm.parcelId)
      if (!parcel) throw new Error('Parcel not found')

      // 1. Pay SOL fee
      const paymentTxSignature = await payFeeSol(feeConfig.citizenFeeSol)

      // 2. Move NFT to Escrow (if it has a mintAddress)
      let nftTransferSignature = null
      if (parcel.mintAddress && parcel.mintAddress !== 'undefined' && feeConfig.solanaConfigured) {
        try {
          nftTransferSignature = await payNftTransfer(parcel.mintAddress)
        } catch (err) {
          console.warn('NFT transfer to escrow failed, skipping real movement (may be dev mode):', err.message)
        }
      }

      // 3. Submit request
      await fetch(`${API_BASE}/api/whitelist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress,
          ownerName: parcel.ownerName || '',
          requestType: 'transfer',
          toWallet: transferForm.toWallet,
          toName: transferForm.toName,
          parcelId: transferForm.parcelId,
          paymentTxSignature,
          nftTransferSignature
        }),
      })
      await fetchWhitelist()
      setShowTransferModal(false)
      setTransferForm({ parcelId: '', toWallet: '', toName: '' })
      fetchParcelsByOwner(walletAddress)
      showNotification('Transfer request submitted. Pending government approval.', 'success')
    } catch (err) {
      console.error('Failed to submit transfer:', err)
      showNotification(paymentErrorMessage(err), 'error')
    }
    setTxLoading(null)
  }

  const truncateHash = (hash) => (hash ? hash.slice(0, 8) + '...' + hash.slice(-8) : '-')

  const formatSize = (size) => {
    if (!size) return '—'
    const parts = []
    if (size.bigha) parts.push(`${size.bigha} Bigha`)
    if (size.kattha) parts.push(`${size.kattha} Kattha`)
    if (size.dhur) parts.push(`${size.dhur} Dhur`)
    return parts.length ? parts.join(', ') : '0 Dhur'
  }

  const pendingRequests = whitelist.filter((w) => w.status === 'pending')
  const proposedRequests = whitelist.filter((w) => w.status === 'proposed')
  const registrationRequests = whitelist.filter((w) => w.status === 'pending' && w.requestType === 'registration')
  const transferRequests = whitelist.filter((w) => w.status === 'pending' && w.requestType === 'transfer')
  const myRequests = walletAddress
    ? whitelist.filter((w) => w.walletAddress === walletAddress)
    : []
  const myParcels = parcels

  const Landing = () => {
    useEffect(() => {
      const handler = (event) => {
        if (!event || !event.data) return
        if (event.data.type === 'jagga-nav') {
          if (event.data.target === 'parcels') {
            setActiveTab('parcels')
          } else if (event.data.target === 'explorer') {
            setActiveTab('explorer')
            fetchParcels()
          }
        }
        if (event.data.type === 'jagga-wallet') {
          const el = document.querySelector('.wallet-adapter-button')
          if (el && typeof el.click === 'function') {
            el.click()
          }
        }
      }
      window.addEventListener('message', handler)
      return () => window.removeEventListener('message', handler)
    }, [])

    return (
      <div className="min-h-screen">
        <iframe
          src="/landing.html"
          title="JaggaChain Landing"
          className="w-full min-h-screen border-0"
        />
        {/* Simple bridge into the React app while keeping the exact landing visual */}
        <div className="fixed bottom-4 right-4 z-50 hidden md:block">
          <button
            type="button"
            onClick={() => setActiveTab('explorer')}
            className="rounded-full bg-primary text-white text-xs font-semibold px-4 py-2 shadow-lg shadow-black/40 hover:bg-red-700 transition-colors"
          >
            Enter App
          </button>
        </div>
      </div>
    )
  }

  const requireWallet = (tab) => {
    if (tab === 'explorer') return false
    return true
  }

  const canAccessTab = (tab) => {
    if (tab === 'explorer') return true
    if (!connected) return false
    if (tab === 'government') return isLRO || isCLRO
    if (tab === 'parcels') return isCitizen
    return true
  }

  return (
    <div className="app-shell min-h-screen bg-page-nepal">
      {notification.message && (
        <div
          className={`fixed top-4 left-1/2 -translate-x-1/2 z-[100] max-w-md w-full mx-4 px-4 py-3 rounded-xl shadow-lg flex items-center justify-between gap-4 animate-fadeIn ${notification.type === 'error' ? 'bg-accent-crimson text-white' : 'bg-emerald-600 text-white'
            }`}
          role="alert"
        >
          <span className="text-sm font-medium">{notification.message}</span>
          <button
            type="button"
            onClick={() => setNotification({ message: null, type: 'success' })}
            className="shrink-0 p-1 rounded-lg hover:bg-white/20 transition"
            aria-label="Dismiss"
          >
            <XCircle className="w-5 h-5" />
          </button>
        </div>
      )}
      {activeTab === 'landing' && <Landing />}

      {/* Single global navbar on all non-landing pages */}
      {activeTab !== 'landing' && (
        <>
          <header className="app-topbar sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="relative flex items-center h-20">
                <button
                  onClick={() => setActiveTab('landing')}
                  className="flex items-center group cursor-pointer shrink-0"
                >
                  <JaggaChainLogo className="text-sm" />
                </button>
                <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-4">
                  <button
                    onClick={() => { setActiveTab('explorer'); fetchParcels() }}
                    className={`flex items-center gap-2 px-5 py-2.5 text-sm md:text-base font-semibold transition-all relative ${activeTab === 'explorer' ? 'text-primary' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    <Globe className="w-4 h-4" /> Public Records
                    {activeTab === 'explorer' && <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary rounded-t-full" />}
                  </button>
                  {isCitizen && (
                  <button
                    onClick={() => { if (!connected) setActiveTab('parcels'); else { setActiveTab('parcels'); fetchParcelsByOwner(walletAddress) } }}
                    className={`flex items-center gap-2 px-5 py-2.5 text-sm md:text-base font-semibold transition-all relative ${activeTab === 'parcels' ? 'text-primary' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    <LayoutDashboard className="w-4 h-4" /> PORTAL
                    {activeTab === 'parcels' && <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary rounded-t-full" />}
                  </button>
                  )}
                    {(isLRO || isCLRO) && (
                      <button
                        onClick={() => { setActiveTab('government'); fetchWhitelist(); fetchStats() }}
                        className={`flex items-center gap-2 px-5 py-2.5 text-sm md:text-base font-semibold transition-all relative ${activeTab === 'government' ? 'text-accent-crimson' : 'text-slate-400 hover:text-slate-600'}`}
                      >
                      <Landmark className="w-4 h-4" /> {isLRO ? 'OFFICER' : 'ADMIN'}
                      {activeTab === 'government' && <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-accent-crimson rounded-t-full" />}
                    </button>
                  )}
                </div>
                <div className="ml-auto flex items-center gap-3">
                  {connected ? (
                    <div className="flex items-center gap-3">
                      <span className="hidden sm:block text-right">
                        <p className="text-xs md:text-sm font-mono text-slate-400">{truncateHash(walletAddress)}</p>
                        <span className={`inline-flex items-center gap-1 text-[11px] md:text-xs font-bold uppercase tracking-wider ${isCLRO ? 'text-accent-crimson' : isLRO ? 'text-amber-600' : 'text-primary'}`}>
                          {isCLRO ? <><Landmark className="w-4 h-4" /> प्रमुख मालपोत अधिकृत</> : isLRO ? <><Landmark className="w-4 h-4" /> मालपोत अधिकृत</> : <><User className="w-4 h-4" /> नागरिक</>}
                        </span>
                      </span>
                      <WalletMultiButton className="!bg-slate-50 !text-slate-800 !border !border-slate-200 !rounded-full !px-5 !py-2.5 !text-sm !font-bold hover:!bg-slate-100 !transition-all" />
                    </div>
                  ) : (
                    <WalletMultiButton className="!bg-primary !text-white !rounded-full !px-6 !py-3 !text-sm md:text-base !font-bold hover:!shadow-lg !transition-all" />
                  )}
                </div>
              </div>
            </div>
          </header>

          <main className="max-w-7xl mx-auto px-4 py-8">
            {activeTab === 'explorer' && (
              <div className="animate-fadeIn space-y-6">
                {/* Section header to match Public Records style */}
                <div>
                  <p className="text-[11px] font-mono tracking-[0.32em] uppercase text-purple-400 mb-1">
                    On-chain land registry
                  </p>
                  <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-1">
                    Public Records
                  </h1>
                  <p className="text-sm md:text-base text-slate-500">
                    No wallet required · Search by owner, district, municipality, or tole.
                  </p>
                </div>

                <div className="premium-card rounded-2xl shadow-sm border border-slate-200 p-6">
                  <h2 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
                    <Search className="w-5 h-5 text-primary" />
                    Search public land records
                  </h2>
                  <p className="text-slate-500 mb-4 font-medium">All registered land parcels across Nepal — publicly verifiable on Solana blockchain.</p>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search by owner, district, municipality, or tole..."
                      value={searchQuery}
                      onChange={(e) => searchParcels(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 border border-slate-200 bg-slate-50 rounded-xl focus:ring-2 focus:ring-primary focus:bg-white focus:border-primary outline-none transition-all font-medium"
                    />
                  </div>
                </div>

                {!searched ? (
                  <div className="premium-card rounded-2xl shadow-sm border border-slate-200 p-16 text-center">
                    <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Globe className="w-10 h-10 text-slate-400" />
                    </div>
                    <h2 className="text-xl font-semibold text-slate-800 mb-2">Public land registry</h2>
                    <p className="text-slate-500">Enter a search term to view land records. Wallet connection is optional here.</p>
                  </div>
                ) : parcels.length === 0 ? (
                  <div className="premium-card rounded-2xl shadow-sm border border-slate-200 p-16 text-center">
                    <FileWarning className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-slate-800 mb-2">No records found</h2>
                    <p className="text-slate-500">No land records match your search.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {parcels.map((parcel) => (
                      <div
                        key={parcel._id}
                        role="button"
                        tabIndex={0}
                        onClick={() => setSelectedParcelDetail(parcel)}
                        onKeyDown={(e) => e.key === 'Enter' && setSelectedParcelDetail(parcel)}
                        className="premium-card rounded-2xl shadow-sm border border-slate-200 overflow-hidden card-hover animate-fadeIn cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30"
                      >
                        <div className="bg-slate-900 px-5 py-4">
                          <div className="flex justify-between items-center">
                            <span className="text-white font-bold tracking-tight">#{parcel.tokenId}</span>
                            <span className="px-2 py-1 bg-green-500/20 text-green-400 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Registered
                            </span>
                          </div>
                        </div>
                        <div className="p-5">
                          <h3 className="font-semibold text-lg text-slate-800 mb-3">{parcel.ownerName}</h3>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-slate-500">Location</span>
                              <span className="text-slate-700 font-medium">
                                {[parcel.location?.province, parcel.location?.district, parcel.location?.municipality].filter(Boolean).join(', ') || '—'}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">Ward</span>
                              <span className="text-slate-700">
                                Ward {parcel.location?.ward}, {parcel.location?.tole}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">Size</span>
                              <span className="text-slate-700 font-medium">{formatSize(parcel.size)}</span>
                            </div>
                            <p className="text-xs text-slate-400 mt-2">Click for full details & transactions</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'parcels' && (
              <div className="animate-fadeIn space-y-6">
                <div>
                  <p className="text-[11px] font-mono tracking-[0.32em] uppercase text-amber-500 mb-1">
                    Citizen portal
                  </p>
                  <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-1">
                    My Parcels & Requests
                  </h1>
                  <p className="text-sm md:text-base text-slate-500">
                    Register new land, see approved parcels, and request ownership transfers.
                  </p>
                </div>

                {!connected ? (
                  <div className="premium-card rounded-2xl shadow-sm border border-slate-200 p-16 text-center">
                    <div className="w-20 h-20 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Lock className="w-10 h-10 text-amber-600" />
                    </div>
                    <h2 className="text-xl font-semibold text-slate-800 mb-2">Connect your wallet</h2>
                    <p className="text-slate-500 mb-6">You need to connect a Solana wallet to view your parcels and transfer requests.</p>
                    <WalletMultiButton className="!bg-red-600 !text-white !rounded-xl !px-6 !py-3 hover:!bg-red-700 !inline-flex" />
                  </div>
                ) : (
                  <div>
                    <div className="premium-card rounded-2xl shadow-sm border border-slate-200 p-6 mb-8">
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                          <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
                            <LayoutDashboard className="w-5 h-5 text-red-600" />
                            My Portal
                          </h2>
                          <p className="text-slate-500 font-mono text-sm">{truncateHash(walletAddress)}</p>
                        </div>
                        <div className="flex gap-3">
                          <button
                            onClick={() => setShowRegisterModal(true)}
                            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-bold hover:translate-y-[-1px] transition-all shadow-lg shadow-primary/20 text-sm"
                          >
                            <FileCheck className="w-4 h-4" /> Register land
                          </button>
                        </div>
                      </div>
                    </div>

                    {myRequests.length > 0 && (
                      <div className="premium-card rounded-2xl shadow-sm border border-[rgba(212,160,23,0.35)] p-6 mb-8">
                        <h3 className="font-semibold mb-4 flex items-center gap-2">
                          <FileCheck className="w-5 h-5" /> My requests
                        </h3>
                        <p className="text-sm text-[rgba(245,237,216,0.7)] mb-4">Click a request to see details.</p>
                        <div className="space-y-2">
                          {myRequests.map((r) => (
                            <div
                              key={r._id}
                              className="rounded-xl border border-[rgba(212,160,23,0.35)] overflow-hidden bg-[rgba(12,8,11,0.95)]"
                            >
                              <div
                                className="flex items-center justify-between p-4 hover:bg-[rgba(37,16,24,0.9)] transition cursor-pointer"
                                onClick={() => setExpandedRequestId(expandedRequestId === r._id ? null : r._id)}
                              >
                                <div className="flex items-center gap-3">
                                  {expandedRequestId === r._id ? (
                                    <ChevronDown className="w-5 h-5 text-[rgba(245,237,216,0.6)] shrink-0" />
                                  ) : (
                                    <ChevronRight className="w-5 h-5 text-[rgba(245,237,216,0.6)] shrink-0" />
                                  )}
                                  <div>
                                    <span className="font-medium">{r.requestType === 'registration' ? 'Registration' : 'Transfer'}</span>
                                    <span
                                      className={`ml-2 px-2 py-0.5 rounded text-xs font-medium border ${
                                        r.status === 'pending'
                                          ? 'border-[rgba(251,191,36,0.6)] text-[rgba(253,224,71,0.95)]'
                                          : r.status === 'approved'
                                          ? 'border-[rgba(16,185,129,0.7)] text-[rgba(110,231,183,0.95)]'
                                          : 'border-[rgba(248,113,113,0.75)] text-[rgba(248,113,113,0.95)]'
                                      }`}
                                    >
                                      {r.status}
                                    </span>
                                  </div>
                                </div>
                                <span className="text-sm text-[rgba(245,237,216,0.6)]">{new Date(r.createdAt).toLocaleDateString()}</span>
                              </div>
                              {expandedRequestId === r._id && (
                                <div className="px-4 pb-4 pt-2 border-t border-[rgba(212,160,23,0.35)] bg-[rgba(18,13,15,0.98)]">
                                  <div className="rounded-xl bg-[rgba(10,6,8,0.9)] border border-[rgba(212,160,23,0.35)] p-4 text-sm space-y-3">
                                    {r.requestType === 'registration' ? (
                                      <>
                                        <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                                          <div><span className="text-[rgba(245,237,216,0.6)]">Owner name</span><br /><span className="font-medium">{r.ownerName}</span></div>
                                          <div><span className="text-[rgba(245,237,216,0.6)]">Wallet</span><br /><span className="font-mono break-all">{r.walletAddress}</span></div>
                                          <div><span className="text-[rgba(245,237,216,0.6)]">Province</span><br /><span>{r.location?.province || '—'}</span></div>
                                          <div><span className="text-[rgba(245,237,216,0.6)]">District</span><br /><span>{r.location?.district || '—'}</span></div>
                                          <div><span className="text-[rgba(245,237,216,0.6)]">Municipality</span><br /><span>{r.location?.municipality || '—'}</span></div>
                                          <div><span className="text-[rgba(245,237,216,0.6)]">Ward</span><br /><span>{r.location?.ward ?? '—'}</span></div>
                                          <div><span className="text-[rgba(245,237,216,0.6)]">Tole</span><br /><span>{r.location?.tole || '—'}</span></div>
                                          <div><span className="text-[rgba(245,237,216,0.6)]">Size</span><br /><span>{formatSize(r.size)}</span></div>
                                          <div><span className="text-[rgba(245,237,216,0.6)]">Submitted</span><br /><span>{new Date(r.createdAt).toLocaleString()}</span></div>
                                        </div>
                                        {r.paymentTxSignature && !r.paymentTxSignature.startsWith('dev-') && (
                                          <div>
                                            <span className="text-[rgba(245,237,216,0.6)]">Payment (proof)</span><br />
                                            <a href={`https://explorer.solana.com/tx/${r.paymentTxSignature}?cluster=devnet`} target="_blank" rel="noopener noreferrer" className="font-mono text-[#7DD3FC] hover:underline inline-flex items-center gap-1">
                                              {truncateHash(r.paymentTxSignature)} <ExternalLink className="w-3.5 h-3.5" />
                                            </a>
                                          </div>
                                        )}
                                      </>
                                    ) : (
                                      <>
                                        <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                                          <div><span className="text-[rgba(245,237,216,0.6)]">From (you)</span><br /><span className="font-medium">{r.ownerName}</span></div>
                                          <div><span className="text-[rgba(245,237,216,0.6)]">Your wallet</span><br /><span className="font-mono break-all">{r.walletAddress}</span></div>
                                          <div><span className="text-[rgba(245,237,216,0.6)]">To (recipient)</span><br /><span>{r.toName}</span></div>
                                          <div><span className="text-[rgba(245,237,216,0.6)]">Recipient wallet</span><br /><span className="font-mono break-all">{r.toWallet}</span></div>
                                          <div><span className="text-[rgba(245,237,216,0.6)]">Parcel ID</span><br /><span className="font-mono">{r.parcelId || '—'}</span></div>
                                          <div><span className="text-[rgba(245,237,216,0.6)]">Submitted</span><br /><span>{new Date(r.createdAt).toLocaleString()}</span></div>
                                        </div>
                                        {r.paymentTxSignature && !r.paymentTxSignature.startsWith('dev-') && (
                                          <div>
                                            <span className="text-[rgba(245,237,216,0.6)]">Payment (proof)</span><br />
                                            <a href={`https://explorer.solana.com/tx/${r.paymentTxSignature}?cluster=devnet`} target="_blank" rel="noopener noreferrer" className="font-mono text-[#7DD3FC] hover:underline inline-flex items-center gap-1">
                                              {truncateHash(r.paymentTxSignature)} <ExternalLink className="w-3.5 h-3.5" />
                                            </a>
                                          </div>
                                        )}
                                      </>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {myParcels.length === 0 ? (
                      <div className="premium-card rounded-2xl shadow-sm border border-slate-200 p-16 text-center">
                        <MapPin className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-slate-800 mb-2">No parcels yet</h2>
                        <p className="text-slate-500 mb-6">You don't have any registered parcels. Register your first land to mint an NFT on Solana.</p>
                        <button
                          onClick={() => setShowRegisterModal(true)}
                          className="inline-flex items-center gap-2 px-8 py-3 bg-primary text-white rounded-xl font-bold hover:translate-y-[-1px] transition-all shadow-lg shadow-primary/20"
                        >
                          <FileCheck className="w-5 h-5" /> Start My Registry
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {myParcels.map((parcel) => (
                          <div
                            key={parcel._id}
                            className="premium-card rounded-2xl shadow-sm border border-slate-200 p-6 card-hover"
                          >
                            <div className="flex flex-wrap items-start justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-3">
                                  <span className="px-3 py-1 bg-slate-800 text-white rounded-lg font-medium">#{parcel.tokenId}</span>
                                  <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-sm rounded-full flex items-center gap-1">
                                    <CheckCircle2 className="w-3.5 h-3.5" /> Active
                                  </span>
                                </div>
                                <h3 className="font-semibold text-lg text-slate-800">{parcel.ownerName}</h3>
                                <p className="text-slate-500">
                                  {[parcel.location?.province, parcel.location?.district, parcel.location?.municipality].filter(Boolean).join(', ')}
                                  {(parcel.location?.ward != null || parcel.location?.tole) ? ` · Ward ${parcel.location?.ward ?? '—'}, ${parcel.location?.tole || '—'}` : ''}
                                </p>
                                <p className="text-sm text-slate-400 mt-2">Size: {formatSize(parcel.size)}</p>
                              </div>
                              <div className="flex flex-col gap-2">
                                <button
                                  onClick={() => {
                                    setTransferForm({ ...transferForm, parcelId: parcel._id })
                                    setShowTransferModal(true)
                                  }}
                                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition text-sm"
                                >
                                  <Zap className="w-4 h-4" /> Transfer
                                </button>
                                {parcel.transactionHash && !parcel.transactionHash.startsWith('dev-') && (
                                  <a
                                    href={`https://explorer.solana.com/tx/${parcel.transactionHash}?cluster=devnet`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition text-sm"
                                  >
                                    <ExternalLink className="w-4 h-4" /> View on Explorer
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'government' && !isLRO && !isCLRO && connected && (
              <div className="premium-card rounded-2xl shadow-sm border border-slate-200 p-16 text-center animate-fadeIn">
                <Landmark className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-slate-800 mb-2">Government access required</h2>
                <p className="text-slate-500 mb-6">This area is only available to Land Revenue Officer or Chief Land Revenue Officer wallets.</p>
                <button onClick={() => setActiveTab('explorer')} className="text-red-600 font-medium hover:underline">Go to Public Records</button>
              </div>
            )}

            {activeTab === 'government' && (isLRO || isCLRO) && (
              <div className="animate-fadeIn space-y-6">
                <div>
                  <p className="text-[11px] font-mono tracking-[0.32em] uppercase text-red-500 mb-1">
                    Government portal
                  </p>
                  <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-1">
                    {isCLRO ? 'Chief Officer Desk' : 'Officer Desk'}
                  </h1>
                  <p className="text-sm md:text-base text-slate-500">
                    {isCLRO
                      ? 'Review proposed registrations and transfers, then approve or reject with on-chain proof.'
                      : 'See citizen records, verify details, and Proposal them to the Chief Land Revenue Officer.'}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="premium-card rounded-2xl shadow-sm border border-slate-200 p-6 card-hover">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-red-100">
                        <Mountain className="w-8 h-8 text-red-600" />
                      </div>
                      <div>
                        <p className="text-3xl font-bold text-slate-800">{stats.totalParcels}</p>
                        <p className="text-sm text-slate-500">Total registered lands</p>
                      </div>
                    </div>
                  </div>
                  {isLRO && (
                  <div className="premium-card rounded-2xl shadow-sm border border-slate-200 p-6 card-hover">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-amber-100">
                        <FileCheck className="w-8 h-8 text-amber-600" />
                      </div>
                      <div>
                        <p className="text-3xl font-bold text-slate-800">{pendingRequests.length}</p>
                        <p className="text-sm text-slate-500">From citizens (pending)</p>
                      </div>
                    </div>
                  </div>
                  )}
                  {isCLRO && (
                  <div className="premium-card rounded-2xl shadow-sm border border-slate-200 p-6 card-hover">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-blue-100">
                        <Zap className="w-8 h-8 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-3xl font-bold text-slate-800">{proposedRequests.length}</p>
                        <p className="text-sm text-slate-500">For approval (proposed)</p>
                      </div>
                    </div>
                  </div>
                  )}
                </div>

                {/* Land Revenue Officer: records from citizens – Proposal (0.05 SOL) */}
                {isLRO && (
                <div className="premium-card rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-8">
                  <div className="bg-amber-900/90 px-6 py-5 border-b border-white/10">
                    <h2 className="text-lg font-black text-white flex items-center gap-2">
                      <FileCheck className="w-5 h-5 text-amber-300" /> Records from citizens (मालपोत अधिकृत)
                    </h2>
                    <p className="text-slate-300 text-sm mt-1">Click Proposal to forward to Chief Land Revenue Officer. Wallet will open. Fee: {feeConfig.lroFeeSol} SOL.</p>
                  </div>
                  {pendingRequests.length === 0 ? (
                    <div className="p-8 text-center text-slate-500">No pending records from citizens.</div>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {pendingRequests.map((item) => (
                        <div key={item._id} className="overflow-hidden">
                          <div
                            className="p-6 flex flex-wrap items-center justify-between gap-4 hover:bg-slate-50 transition cursor-pointer"
                            onClick={() => setExpandedRequestId(expandedRequestId === item._id ? null : item._id)}
                          >
                            <div className="flex items-center gap-3">
                              {expandedRequestId === item._id ? (
                                <ChevronDown className="w-5 h-5 text-slate-400" />
                              ) : (
                                <ChevronRight className="w-5 h-5 text-slate-400" />
                              )}
                              <div>
                                <h3 className="font-semibold text-slate-800">{item.ownerName}</h3>
                                <p className="text-sm text-slate-500 font-mono">{truncateHash(item.walletAddress)}</p>
                                <span className="inline-block mt-1 px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600">
                                  {item.requestType === 'registration' ? 'Registration' : 'Transfer'}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              {txLoading === item._id ? (
                                <span className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl inline-flex items-center gap-2">
                                  <Loader2 className="w-4 h-4 animate-spin" /> Processing
                                </span>
                              ) : (
                                <button
                                  onClick={(e) => { e.stopPropagation(); handlePropose(item._id) }}
                                  className="flex items-center gap-1 px-4 py-2 bg-amber-600 text-white rounded-xl font-medium hover:bg-amber-700 transition text-sm"
                                >
                                  <Zap className="w-4 h-4" /> Proposal
                                </button>
                              )}
                            </div>
                          </div>
                          {expandedRequestId === item._id && (
                            <div className="px-6 pb-6 pt-0 animate-fadeIn">
                              <div className="rounded-xl bg-slate-50 border border-slate-100 p-5 text-sm space-y-3">
                                <div className="grid grid-cols-2 gap-x-8 gap-y-2">
                                  <div><span className="text-slate-500">Owner</span><br /><span className="font-medium text-slate-800">{item.ownerName}</span></div>
                                  <div><span className="text-slate-500">Wallet</span><br /><span className="font-mono text-slate-800 break-all">{item.walletAddress}</span></div>
                                  <div><span className="text-slate-500">Province</span><br /><span className="text-slate-800">{item.location?.province || '—'}</span></div>
                                  <div><span className="text-slate-500">District</span><br /><span className="text-slate-800">{item.location?.district}</span></div>
                                  <div><span className="text-slate-500">Municipality</span><br /><span className="text-slate-800">{item.location?.municipality}</span></div>
                                  <div><span className="text-slate-500">Ward / Tole</span><br /><span className="text-slate-800">{item.location?.ward} / {item.location?.tole}</span></div>
                                  <div><span className="text-slate-500">Size</span><br /><span className="text-slate-800">{formatSize(item.size)}</span></div>
                                  {item.requestType === 'transfer' && (
                                    <>
                                      <div><span className="text-slate-500">To (name)</span><br /><span className="text-slate-800">{item.toName}</span></div>
                                      <div><span className="text-slate-500">To (wallet)</span><br /><span className="font-mono text-slate-800 break-all">{item.toWallet}</span></div>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                )}

                {/* Chief Land Revenue Officer: proposed records – Approve / Reject (0.08 SOL) */}
                {isCLRO && (
                <div className="premium-card rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="bg-slate-900 px-6 py-5 border-b border-white/10">
                    <h2 className="text-lg font-black text-white flex items-center gap-2">
                      <Landmark className="w-5 h-5 text-primary" /> Records for approval (प्रमुख मालपोत अधिकृत)
                    </h2>
                    <p className="text-slate-400 text-sm mt-1">Approve or reject. Wallet will open. Fee: {feeConfig.clroFeeSol} SOL per action.</p>
                  </div>
                  {proposedRequests.length === 0 ? (
                    <div className="p-8 text-center text-slate-500">No proposed records for approval.</div>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {proposedRequests.map((item) => (
                        <div key={item._id} className="overflow-hidden">
                          <div
                            className="p-6 flex flex-wrap items-center justify-between gap-4 hover:bg-slate-50 transition cursor-pointer"
                            onClick={() => setExpandedRequestId(expandedRequestId === item._id ? null : item._id)}
                          >
                            <div className="flex items-center gap-3">
                              {expandedRequestId === item._id ? (
                                <ChevronDown className="w-5 h-5 text-slate-400" />
                              ) : (
                                <ChevronRight className="w-5 h-5 text-slate-400" />
                              )}
                              <div>
                                <h3 className="font-semibold text-slate-800">{item.ownerName || 'Transfer'}</h3>
                                <p className="text-sm text-slate-500 font-mono">From: {truncateHash(item.walletAddress)}</p>
                                <span className="inline-block mt-1 px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600">
                                  {item.requestType === 'registration' ? 'Registration' : 'Transfer'}
                                </span>
                                {item.toName && (
                                  <p className="text-sm text-slate-500 mt-0.5">
                                    To: {item.toName} ({truncateHash(item.toWallet)})
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              {txLoading === item._id ? (
                                <span className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl inline-flex items-center gap-2">
                                  <Loader2 className="w-4 h-4 animate-spin" /> Processing
                                </span>
                              ) : (
                                <div className="flex gap-2">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleWhitelistAction(item._id, 'approved')
                                    }}
                                    className="flex items-center gap-1 px-4 py-2 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition text-sm"
                                  >
                                    <CheckCircle2 className="w-4 h-4" /> Approve
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleWhitelistAction(item._id, 'rejected')
                                    }}
                                    className="flex items-center gap-1 px-4 py-2 bg-accent-crimson text-white rounded-xl font-bold hover:bg-red-700 transition text-sm"
                                  >
                                    <XCircle className="w-4 h-4" /> Reject
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                          {expandedRequestId === item._id && (
                            <div className="px-6 pb-6 pt-0 animate-fadeIn">
                              <div className="rounded-xl bg-slate-50 border border-slate-100 p-5 text-sm space-y-3">
                                <div className="grid grid-cols-2 gap-x-8 gap-y-2">
                                  <div><span className="text-slate-500">Owner</span><br /><span className="font-medium text-slate-800">{item.ownerName}</span></div>
                                  <div><span className="text-slate-500">Wallet</span><br /><span className="font-mono text-slate-800 break-all">{item.walletAddress}</span></div>
                                  {item.requestType === 'registration' ? (
                                    <>
                                      <div><span className="text-slate-500">Province</span><br /><span className="text-slate-800">{item.location?.province || '—'}</span></div>
                                      <div><span className="text-slate-500">District</span><br /><span className="text-slate-800">{item.location?.district}</span></div>
                                      <div><span className="text-slate-500">Municipality</span><br /><span className="text-slate-800">{item.location?.municipality}</span></div>
                                      <div><span className="text-slate-500">Ward / Tole</span><br /><span className="text-slate-800">{item.location?.ward} / {item.location?.tole}</span></div>
                                      <div><span className="text-slate-500">Size</span><br /><span className="text-slate-800">{formatSize(item.size)}</span></div>
                                    </>
                                  ) : (
                                    <>
                                      <div><span className="text-slate-500">To (recipient)</span><br /><span className="text-slate-800">{item.toName}</span></div>
                                      <div><span className="text-slate-500">To wallet</span><br /><span className="font-mono text-slate-800 break-all">{item.toWallet}</span></div>
                                      <div><span className="text-slate-500">Parcel ID</span><br /><span className="font-mono text-slate-800">{item.parcelId}</span></div>
                                    </>
                                  )}
                                  <div><span className="text-slate-500">Submitted</span><br /><span className="text-slate-800">{new Date(item.createdAt).toLocaleString()}</span></div>
                                  {item.paymentTxSignature && (
                                    <div className="col-span-2">
                                      <span className="text-slate-500">SOL Fee Signature (Proof)</span><br />
                                      <a href={`https://explorer.solana.com/tx/${item.paymentTxSignature}?cluster=devnet`} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline font-mono text-xs break-all flex items-center gap-1">
                                        <ExternalLink className="w-3 h-3" /> {item.paymentTxSignature}
                                      </a>
                                    </div>
                                  )}
                                  {item.nftTransferSignature && (
                                    <div className="col-span-2">
                                      <span className="text-slate-500">NFT Escrow Signature (Proof)</span><br />
                                      <a href={`https://explorer.solana.com/tx/${item.nftTransferSignature}?cluster=devnet`} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline font-mono text-xs break-all flex items-center gap-1">
                                        <ExternalLink className="w-3 h-3" /> {item.nftTransferSignature}
                                      </a>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                )}
              </div>
            )}
          </main>
        </>
      )}

      {selectedParcelDetail && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedParcelDetail(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" /> Record #{selectedParcelDetail.tokenId} – Full details
              </h2>
              <button
                type="button"
                onClick={() => setSelectedParcelDetail(null)}
                className="p-2 rounded-lg hover:bg-slate-100 text-slate-500"
                aria-label="Close"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="rounded-xl bg-slate-50 border border-slate-100 p-4">
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">Parcel details</h3>
                <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                  <div><span className="text-slate-500">Token ID</span><br /><span className="font-semibold text-slate-800">#{selectedParcelDetail.tokenId}</span></div>
                  <div><span className="text-slate-500">Status</span><br /><span className="font-semibold text-slate-800">{selectedParcelDetail.status || 'registered'}</span></div>
                  <div className="col-span-2"><span className="text-slate-500">Owner name</span><br /><span className="font-semibold text-slate-800">{selectedParcelDetail.ownerName}</span></div>
                  <div className="col-span-2"><span className="text-slate-500">Owner wallet</span><br /><span className="font-mono text-slate-800 break-all">{selectedParcelDetail.ownerWallet}</span></div>
                  <div><span className="text-slate-500">Province</span><br /><span className="text-slate-800">{selectedParcelDetail.location?.province || '—'}</span></div>
                  <div><span className="text-slate-500">District</span><br /><span className="text-slate-800">{selectedParcelDetail.location?.district || '—'}</span></div>
                  <div><span className="text-slate-500">Municipality</span><br /><span className="text-slate-800">{selectedParcelDetail.location?.municipality || '—'}</span></div>
                  <div><span className="text-slate-500">Ward / Tole</span><br /><span className="text-slate-800">Ward {selectedParcelDetail.location?.ward ?? '—'}, {selectedParcelDetail.location?.tole || '—'}</span></div>
                  <div><span className="text-slate-500">Size</span><br /><span className="text-slate-800 font-medium">{formatSize(selectedParcelDetail.size)}</span></div>
                  {selectedParcelDetail.mintAddress && <div><span className="text-slate-500">Mint (NFT)</span><br /><span className="font-mono text-xs text-slate-600 break-all">{selectedParcelDetail.mintAddress}</span></div>}
                  {selectedParcelDetail.documentHash && <div><span className="text-slate-500">Document hash</span><br /><span className="font-mono text-xs text-slate-600 break-all">{selectedParcelDetail.documentHash}</span></div>}
                  <div><span className="text-slate-500">Created</span><br /><span className="text-slate-800">{selectedParcelDetail.createdAt ? new Date(selectedParcelDetail.createdAt).toLocaleString() : '—'}</span></div>
                  <div><span className="text-slate-500">Updated</span><br /><span className="text-slate-800">{selectedParcelDetail.updatedAt ? new Date(selectedParcelDetail.updatedAt).toLocaleString() : '—'}</span></div>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 overflow-hidden">
                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider px-4 py-3 bg-slate-50 border-b border-slate-100">Three transactions</h3>
                <div className="divide-y divide-slate-100">
                  <div className="p-4">
                    <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">User transaction (नागरिक - CITIZEN)</p>
                    {(() => {
                      const sig = selectedParcelDetail.citizenTxSignature ?? parcelRegistrationProof?.citizenTxSignature
                      return sig && !String(sig).startsWith('dev-') ? (
                        <a href={`https://explorer.solana.com/tx/${sig}?cluster=devnet`} target="_blank" rel="noopener noreferrer" className="font-mono text-sm text-primary hover:underline inline-flex items-center gap-1 break-all">
                          {truncateHash(sig)} <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                        </a>
                      ) : (
                        <span className="text-slate-400 text-sm">— Not recorded</span>
                      )
                    })()}
                  </div>
                  <div className="p-4">
                    <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Malpot officer transaction (मालपोत अधिकृत - LAND REVENUE OFFICER)</p>
                    {(() => {
                      const sig = selectedParcelDetail.lroProposalTxSignature ?? parcelRegistrationProof?.lroProposalTxSignature
                      return sig && !String(sig).startsWith('dev-') ? (
                        <a href={`https://explorer.solana.com/tx/${sig}?cluster=devnet`} target="_blank" rel="noopener noreferrer" className="font-mono text-sm text-amber-600 hover:underline inline-flex items-center gap-1 break-all">
                          {truncateHash(sig)} <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                        </a>
                      ) : (
                        <span className="text-slate-400 text-sm">— Not recorded</span>
                      )
                    })()}
                  </div>
                  <div className="p-4">
                    <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Chief officer transaction (प्रमुख मालपोत अधिकृत - CHIEF LAND REVENUE OFFICER)</p>
                    {(() => {
                      const sig = selectedParcelDetail.clroDecisionTxSignature ?? parcelRegistrationProof?.clroDecisionTxSignature
                      return sig && !String(sig).startsWith('dev-') ? (
                        <a href={`https://explorer.solana.com/tx/${sig}?cluster=devnet`} target="_blank" rel="noopener noreferrer" className="font-mono text-sm text-accent-crimson hover:underline inline-flex items-center gap-1 break-all">
                          {truncateHash(sig)} <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                        </a>
                      ) : (
                        <span className="text-slate-400 text-sm">— Not recorded</span>
                      )
                    })()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showRegisterModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowRegisterModal(false)}
        >
          <div
            className="premium-card rounded-2xl shadow-2xl border border-[rgba(212,160,23,0.35)] p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-black mb-4 flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-[#F5C842]" /> Register new land
            </h2>
            <p className="text-sm text-[rgba(245,237,216,0.75)] mb-4">
              {feeConfig.citizenFeeSol > 0 ? `${feeConfig.citizenFeeSol} SOL (proof)` : 'Network fee only (no protocol fee)'}{!feeConfig.treasuryWallet && feeConfig.citizenFeeSol > 0 && ' — dev: paying to your wallet'}
            </p>
            {!feeConfig.solanaConfigured && (
              <div className="mb-4 p-3 rounded-xl bg-[rgba(251,191,36,0.12)] border border-[rgba(251,191,36,0.6)] text-[rgba(253,224,71,0.9)] text-sm">
                Backend Solana RPC is not configured. Set <strong>SOLANA_RPC_URL</strong> in <strong>backend/.env</strong> and restart the backend so fee payment works.
              </div>
            )}
            {feeConfig.solanaConfigured && (
              <div className="mb-4 p-3 rounded-xl bg-[rgba(20,241,149,0.08)] border border-[rgba(20,241,149,0.4)] text-[rgba(209,250,229,0.9)] text-sm">
                When you submit, <strong>your wallet (e.g. Phantom) will open</strong>. Confirm the transaction there — that is your Solana proof. After government approval, a parcel NFT will be minted to your wallet.
              </div>
            )}
            <form onSubmit={handleRegistration} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Owner name</label>
                <input
                  required
                  type="text"
                  value={registerForm.ownerName}
                  onChange={(e) => setRegisterForm({ ...registerForm, ownerName: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-[rgba(212,160,23,0.4)] bg-[#0A0608] text-[#F5EDD8] focus:ring-2 focus:ring-[#F5C842] outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Province</label>
                <select
                  required
                  value={registerForm.province}
                  onChange={(e) => {
                    const province = e.target.value
                    setRegisterForm({ ...registerForm, province, district: '' })
                    setDistrictSearch('')
                    setDistrictDropdownOpen(false)
                  }}
                  className="w-full px-4 py-2.5 rounded-xl border border-[rgba(212,160,23,0.4)] bg-[#0A0608] text-[#F5EDD8] focus:ring-2 focus:ring-[#F5C842] outline-none"
                >
                  <option value="">Select province</option>
                  {NEPAL_PROVINCES.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
              <div className="relative">
                <label className="block text-sm font-medium mb-1">District</label>
                <input
                  required
                  type="text"
                  placeholder="Type to search (e.g. r for Ramechhap, Rautahat...)"
                  value={districtSearch || registerForm.district}
                  onChange={(e) => {
                    const q = e.target.value
                    setDistrictSearch(q)
                    setDistrictDropdownOpen(true)
                    if (!q) setRegisterForm((f) => ({ ...f, district: '' }))
                    else {
                      const provinceDistricts = NEPAL_DISTRICTS_BY_PROVINCE[registerForm.province] || []
                      const match = provinceDistricts.find((d) => d.toLowerCase().startsWith(q.toLowerCase()))
                      if (match && match.toLowerCase() === q.toLowerCase()) setRegisterForm((f) => ({ ...f, district: match }))
                      else setRegisterForm((f) => ({ ...f, district: '' }))
                    }
                  }}
                  onFocus={() => setDistrictDropdownOpen(true)}
                  onBlur={() => setTimeout(() => setDistrictDropdownOpen(false), 180)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[rgba(212,160,23,0.4)] bg-[#0A0608] text-[#F5EDD8] focus:ring-2 focus:ring-[#F5C842] outline-none"
                />
                {districtDropdownOpen && registerForm.province && (
                  <ul className="absolute z-20 mt-1 w-full max-h-48 overflow-y-auto rounded-xl border border-[rgba(212,160,23,0.4)] bg-[#120D0F] shadow-lg py-1">
                    {((NEPAL_DISTRICTS_BY_PROVINCE[registerForm.province] || []).filter((d) =>
                      !districtSearch || d.toLowerCase().startsWith(districtSearch.toLowerCase())
                    )).map((d) => (
                      <li
                        key={d}
                        onMouseDown={(e) => { e.preventDefault(); setRegisterForm((f) => ({ ...f, district: d })); setDistrictSearch(d); setDistrictDropdownOpen(false) }}
                        className={`px-4 py-2 cursor-pointer ${registerForm.district === d ? 'bg-[rgba(245,200,66,0.15)] text-[#F5C842] font-medium' : 'hover:bg-[rgba(37,37,37,0.8)] text-[rgba(245,237,216,0.9)]'}`}
                      >
                        {d}
                      </li>
                    ))}
                    {registerForm.province && (NEPAL_DISTRICTS_BY_PROVINCE[registerForm.province] || []).filter((d) =>
                      !districtSearch || d.toLowerCase().startsWith(districtSearch.toLowerCase())
                    ).length === 0 && (
                      <li className="px-4 py-2 text-[rgba(245,237,216,0.6)]">No district starting with &quot;{districtSearch}&quot;</li>
                    )}
                  </ul>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Municipality</label>
                  <input
                    required
                    type="text"
                    value={registerForm.municipality}
                    onChange={(e) => setRegisterForm({ ...registerForm, municipality: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-[rgba(212,160,23,0.4)] bg-[#0A0608] text-[#F5EDD8] focus:ring-2 focus:ring-[#F5C842] outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Ward</label>
                  <input
                    required
                    type="number"
                    value={registerForm.ward}
                    onChange={(e) => setRegisterForm({ ...registerForm, ward: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-[rgba(212,160,23,0.4)] bg-[#0A0608] text-[#F5EDD8] focus:ring-2 focus:ring-[#F5C842] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Tole</label>
                  <input
                    required
                    type="text"
                    value={registerForm.tole}
                    onChange={(e) => setRegisterForm({ ...registerForm, tole: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-[rgba(212,160,23,0.4)] bg-[#0A0608] text-[#F5EDD8] focus:ring-2 focus:ring-[#F5C842] outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Bigha</label>
                  <input
                    type="number"
                    value={registerForm.bigha}
                    onChange={(e) => setRegisterForm({ ...registerForm, bigha: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-[rgba(212,160,23,0.4)] bg-[#0A0608] text-[#F5EDD8] focus:ring-2 focus:ring-[#F5C842] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Kattha</label>
                  <input
                    type="number"
                    value={registerForm.kattha}
                    onChange={(e) => setRegisterForm({ ...registerForm, kattha: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-[rgba(212,160,23,0.4)] bg-[#0A0608] text-[#F5EDD8] focus:ring-2 focus:ring-[#F5C842] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Dhur</label>
                  <input
                    type="number"
                    value={registerForm.dhur}
                    onChange={(e) => setRegisterForm({ ...registerForm, dhur: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-[rgba(212,160,23,0.4)] bg-[#0A0608] text-[#F5EDD8] focus:ring-2 focus:ring-[#F5C842] outline-none"
                  />
                </div>
              </div>
              <div className="bg-[rgba(153,69,255,0.12)] border border-[rgba(153,69,255,0.35)] p-4 rounded-xl">
                <p className="text-sm text-[rgba(245,237,216,0.85)] flex items-center gap-2">
                  <Zap className="w-4 h-4 shrink-0 text-[#F5C842]" />
                  After government approval, an NFT will be minted on Solana and the record will be visible on Explorer. A small fee may apply.
                </p>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowRegisterModal(false); setDistrictSearch(''); setDistrictDropdownOpen(false) }}
                  className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={txLoading === 'registering'}
                  className="flex-1 px-4 py-2.5 bg-primary text-white rounded-xl font-bold hover:translate-y-[-1px] transition-all shadow-lg shadow-primary/20 disabled:opacity-50 inline-flex items-center justify-center gap-2"
                >
                  {txLoading === 'registering' ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Submitting…
                    </>
                  ) : (
                    'Submit for approval'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showTransferModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowTransferModal(false)}
        >
          <div
            className="premium-card rounded-2xl shadow-2xl border border-slate-200 p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-black text-slate-900 mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-accent-crimson" /> Transfer parcel
            </h2>
            <p className="text-sm text-slate-500 mb-4">
              {feeConfig.citizenFeeSol > 0 ? `${feeConfig.citizenFeeSol} SOL (proof)` : 'Network fee only (no protocol fee)'}{!feeConfig.treasuryWallet && feeConfig.citizenFeeSol > 0 && ' — dev: paying to your wallet'}
            </p>
            {!feeConfig.solanaConfigured && (
              <div className="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm">
                Backend Solana RPC is not configured. Set <strong>SOLANA_RPC_URL</strong> in <strong>backend/.env</strong> and restart the backend.
              </div>
            )}
            {feeConfig.solanaConfigured && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm">
                When you submit, <strong>your wallet will open</strong>. Confirm the transaction — that records your transfer request on Solana.
              </div>
            )}
            <form onSubmit={handleTransfer} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Recipient name</label>
                <input
                  required
                  type="text"
                  value={transferForm.toName}
                  onChange={(e) => setTransferForm({ ...transferForm, toName: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Recipient Solana wallet</label>
                <input
                  required
                  type="text"
                  value={transferForm.toWallet}
                  onChange={(e) => setTransferForm({ ...transferForm, toWallet: e.target.value })}
                  placeholder="Base58 address"
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 outline-none font-mono text-sm"
                />
              </div>
              <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl">
                <p className="text-sm text-amber-800">
                  Transfer requires government approval. After approval, an NFT will be minted/updated on Solana.
                </p>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowTransferModal(false)}
                  className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={txLoading === 'transferring'}
                  className="flex-1 px-4 py-2.5 bg-accent-crimson text-white rounded-xl font-bold hover:translate-y-[-1px] transition-all shadow-lg shadow-accent-crimson/20 disabled:opacity-50 inline-flex items-center justify-center gap-2"
                >
                  {txLoading === 'transferring' ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Processing…
                    </>
                  ) : (
                    'Request transfer'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
