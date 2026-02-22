import { useState, useEffect, useMemo } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
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
} from 'lucide-react'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000'
const ADMIN_WALLETS = (import.meta.env.VITE_ADMIN_WALLETS || '8b29vHx8ZdAQp9vNSLSgmNxeqgPZbyqE6paPdwVvXYSB').split(',').map((w) => w.trim())

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

/** Hexagon logo: Nepal red/blue, mountains/land, data/blockchain */
const JaggaChainLogo = ({ className = 'h-10 w-auto' }) => (
  <svg viewBox="0 0 48 48" className={className} fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
    <defs>
      <linearGradient id="logo-blue" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#1E3A8A" />
        <stop offset="100%" stopColor="#0f1e52" />
      </linearGradient>
    </defs>
    {/* Hexagon – double border */}
    <path d="M24 2 L44 14 L44 34 L24 46 L4 34 L4 14 Z" stroke="url(#logo-blue)" strokeWidth="2.5" fill="none" />
    <path d="M24 5 L40 15 L40 33 L24 42 L8 33 L8 15 Z" stroke="#1E3A8A" strokeWidth="1.2" fill="none" opacity="0.7" />
    {/* Base – darker blue */}
    <path d="M14 32 L34 32 L32 38 L16 38 Z" fill="#0f1e52" />
    {/* Central red – mountains/roofline */}
    <path d="M16 38 L24 22 L32 38 Z" fill="#DC2626" />
    {/* Line graph – red curve with nodes */}
    <path d="M12 14 Q24 8 36 14" stroke="#DC2626" strokeWidth="1.8" fill="none" strokeLinecap="round" />
    <circle cx="14" cy="15" r="2.5" fill="#DC2626" />
    <circle cx="24" cy="11" r="2.5" fill="#DC2626" />
    <circle cx="34" cy="15" r="2.5" fill="#DC2626" />
  </svg>
)

function App() {
  const { publicKey, connected } = useWallet()
  const walletAddress = publicKey?.toBase58() || null
  const isAdmin = useMemo(() => walletAddress && ADMIN_WALLETS.includes(walletAddress), [walletAddress])

  const [activeTab, setActiveTab] = useState('landing')
  const [parcels, setParcels] = useState([])
  const [whitelist, setWhitelist] = useState([])
  const [stats, setStats] = useState({ totalParcels: 0, pendingRegistrations: 0, pendingTransfers: 0 })
  const [searchQuery, setSearchQuery] = useState('')
  const [searched, setSearched] = useState(false)
  const [showRegisterModal, setShowRegisterModal] = useState(false)
  const [showTransferModal, setShowTransferModal] = useState(false)
  const [txLoading, setTxLoading] = useState(null)
  const [expandedRequestId, setExpandedRequestId] = useState(null)
  const [registerForm, setRegisterForm] = useState({
    ownerName: '',
    district: '',
    municipality: '',
    ward: '',
    tole: '',
    bigha: '',
    kattha: '',
    dhur: '',
  })
  const [transferForm, setTransferForm] = useState({
    parcelId: '',
    toWallet: '',
    toName: '',
  })

  useEffect(() => {
    fetchStats()
  }, [])

  useEffect(() => {
    if (connected && walletAddress) {
      if (isAdmin) fetchWhitelist()
      else {
        fetchParcelsByOwner(walletAddress)
        fetchWhitelist()
      }
    }
  }, [connected, walletAddress, isAdmin])

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

  const handleWhitelistAction = async (id, status) => {
    setTxLoading(id)
    try {
      const res = await fetch(`${API_BASE}/api/whitelist/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (res.ok) {
        await fetchWhitelist()
        await fetchStats()
        if (walletAddress && !isAdmin) fetchParcelsByOwner(walletAddress)
      }
    } catch (err) {
      console.error('Failed to update whitelist:', err)
    }
    setTxLoading(null)
  }

  const handleRegistration = async (e) => {
    e.preventDefault()
    if (!walletAddress) return
    setTxLoading('registering')
    try {
      await fetch(`${API_BASE}/api/whitelist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress,
          ownerName: registerForm.ownerName,
          requestType: 'registration',
          location: {
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
        }),
      })
      await fetchWhitelist()
      setShowRegisterModal(false)
      setRegisterForm({ ownerName: '', district: '', municipality: '', ward: '', tole: '', bigha: '', kattha: '', dhur: '' })
    } catch (err) {
      console.error('Failed to submit registration:', err)
    }
    setTxLoading(null)
  }

  const handleTransfer = async (e) => {
    e.preventDefault()
    if (!walletAddress) return
    setTxLoading('transferring')
    try {
      await fetch(`${API_BASE}/api/whitelist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress,
          ownerName: (myParcels.find(p => p._id === transferForm.parcelId)?.ownerName) || '',
          requestType: 'transfer',
          toWallet: transferForm.toWallet,
          toName: transferForm.toName,
          parcelId: transferForm.parcelId,
        }),
      })
      await fetchWhitelist()
      setShowTransferModal(false)
      setTransferForm({ parcelId: '', toWallet: '', toName: '' })
      fetchParcelsByOwner(walletAddress)
    } catch (err) {
      console.error('Failed to submit transfer:', err)
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

  const registrationRequests = whitelist.filter((w) => w.status === 'pending' && w.requestType === 'registration')
  const transferRequests = whitelist.filter((w) => w.status === 'pending' && w.requestType === 'transfer')
  const myRequests = walletAddress
    ? whitelist.filter((w) => w.walletAddress === walletAddress)
    : []
  const myParcels = parcels

  const Landing = () => (
    <div className="min-h-screen bg-page-nepal">
      {/* Topnotch navbar – minimal, light, pill buttons */}
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-[var(--nav-bg)] backdrop-blur-md" style={{ boxShadow: '0 1px 0 rgba(0,0,0,0.04)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button onClick={() => setActiveTab('landing')} className="flex items-center gap-3 hover:opacity-80 transition">
              <JaggaChainLogo className="h-10 w-10 shrink-0" />
              <span className="text-xl font-bold tracking-tight text-[var(--text-primary)] font-display">JaggaChain</span>
            </button>
            <nav className="hidden md:flex items-center gap-8">
              <button onClick={() => setActiveTab('explorer')} className="text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)] transition">
                Explorer
              </button>
              <a href="#problem" className="text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)] transition">About</a>
              <a href="#solution" className="text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)] transition">Features</a>
            </nav>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setActiveTab('explorer')}
                className="nav-pill nav-pill-secondary hidden sm:inline-flex items-center gap-2"
              >
                <Globe className="w-4 h-4" /> Public records
              </button>
              <WalletMultiButton className="nav-pill nav-pill-primary !bg-[var(--nepal-blue-dark)] !text-white !rounded-full !px-5 !py-2.5 !text-sm !font-semibold hover:!bg-[var(--nepal-blue)]" />
            </div>
          </div>
        </div>
      </header>

      {/* Hero – left: headline + CTA; right: Nepal + land + solution visual */}
      <section className="relative min-h-[85vh] flex items-center overflow-hidden bg-hero-nepal">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="animate-fadeInUp">
              <h1 className="text-4xl sm:text-5xl lg:text-[3.25rem] font-bold text-[var(--text-primary)] leading-[1.15] tracking-tight mb-6">
                Register your land
                <br />
                <span className="gradient-text">on blockchain.</span>
              </h1>
              <p className="text-lg text-[var(--text-secondary)] max-w-lg mb-10 leading-relaxed">
                With JaggaChain, every title is an NFT on Solana—tamper-proof, transparent, and viewable on-chain. Government of Nepal.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <WalletMultiButton className="!rounded-full !px-8 !py-3.5 !text-base !font-semibold !bg-[var(--nepal-blue-dark)] !text-white hover:!bg-[var(--nepal-blue)] !shadow-[var(--shadow-card)] !inline-flex !items-center !justify-center !gap-2 w-full sm:w-auto [&>.wallet-adapter-button-start-icon]:!w-5 [&>.wallet-adapter-button-start-icon]:!h-5" />
                <button
                  onClick={() => setActiveTab('explorer')}
                  className="nav-pill nav-pill-secondary inline-flex items-center justify-center gap-2 w-full sm:w-auto"
                >
                  <Globe className="w-4 h-4" /> Browse public records
                </button>
              </div>
            </div>
            <div className="hidden lg:flex justify-center items-center animate-fadeInUp animate-delay-200">
              <svg viewBox="0 0 320 280" className="w-full max-w-md h-auto" aria-hidden>
                <defs>
                  <linearGradient id="nepal-mountain" x1="0%" y1="100%" x2="0%" y2="0%">
                    <stop offset="0%" stopColor="#1E3A8A" stopOpacity="0.95" />
                    <stop offset="100%" stopColor="#2563EB" stopOpacity="0.7" />
                  </linearGradient>
                  <linearGradient id="nepal-land" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#DC2626" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#1E3A8A" stopOpacity="0.15" />
                  </linearGradient>
                </defs>
                {/* Himalayan silhouette – Nepal */}
                <path fill="url(#nepal-mountain)" d="M0 200 L40 120 L80 160 L120 80 L160 140 L200 60 L240 100 L280 40 L320 80 L320 280 L0 280 Z" opacity="0.9" />
                {/* Land parcels / registry – divided land */}
                <path fill="url(#nepal-land)" d="M0 220 L320 220 L320 280 L0 280 Z" />
                <line x1="80" y1="220" x2="80" y2="280" stroke="#1E3A8A" strokeWidth="1.5" opacity="0.4" />
                <line x1="160" y1="220" x2="160" y2="280" stroke="#1E3A8A" strokeWidth="1.5" opacity="0.4" />
                <line x1="240" y1="220" x2="240" y2="280" stroke="#1E3A8A" strokeWidth="1.5" opacity="0.4" />
                {/* Chain nodes – blockchain / Solana */}
                <g fill="#1E3A8A" opacity="0.85">
                  <circle cx="60" cy="250" r="6" />
                  <circle cx="140" cy="250" r="6" />
                  <circle cx="220" cy="250" r="6" />
                  <circle cx="300" cy="250" r="6" />
                </g>
                <path d="M54 250 H126 M134 250 H206 M214 250 H294" stroke="#1E3A8A" strokeWidth="2" fill="none" opacity="0.5" strokeLinecap="round" />
              </svg>
            </div>
          </div>
        </div>
      </section>

      <section id="problem" className="py-20 lg:py-28 bg-section-nepal border-t border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl lg:text-4xl font-display font-bold text-center text-[var(--text-primary)] mb-3">The Problem</h2>
          <p className="text-center text-[var(--text-secondary)] mb-14 max-w-2xl mx-auto text-lg">
            Traditional land records in Nepal are paper-based and fragmented, leading to disputes and delays.
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: FileWarning,
                title: 'Fraud & forgery',
                desc: 'Paper records can be altered or duplicated, enabling fraudulent sales and ownership disputes.',
                img: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400&h=260&fit=crop',
              },
              {
                icon: Zap,
                title: 'Time consuming',
                desc: 'Verification takes weeks with multiple office visits and stacks of paperwork.',
                img: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400&h=260&fit=crop',
              },
              {
                icon: Lock,
                title: 'Lack of transparency',
                desc: 'Citizens cannot easily verify ownership or history, creating information asymmetry.',
                img: 'https://images.unsplash.com/photo-1560518883-ce09059e617c?w=400&h=260&fit=crop',
              },
            ].map((item, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden card-hover animate-fadeIn shadow-[var(--shadow-card)]"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="h-44 overflow-hidden">
                  <img src={item.img} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2.5 bg-slate-100 rounded-xl">
                      <item.icon className="w-5 h-5 text-[var(--nepal-blue)]" />
                    </div>
                    <h3 className="text-lg font-semibold text-[var(--text-primary)]">{item.title}</h3>
                  </div>
                  <p className="text-[var(--text-secondary)] text-[15px] leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="solution" className="py-20 lg:py-28 bg-white border-t border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl lg:text-4xl font-display font-bold text-center text-[var(--text-primary)] mb-3">What JaggaChain solves</h2>
          <p className="text-center text-[var(--text-secondary)] mb-14 max-w-2xl mx-auto text-lg">
            A single source of truth on Solana: every registration and transfer is minted as an NFT and recorded on-chain in real time.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Shield, title: 'Immutable records', desc: 'Each parcel is an NFT on Solana. No one can alter history.' },
              { icon: Zap, title: 'Real-time minting', desc: 'Registration and transfer NFTs mint on approval; view on Solana Explorer.' },
              { icon: User, title: 'Citizen portal', desc: 'Connect your wallet to see your parcels and transfer requests.' },
              { icon: Landmark, title: 'Government approval', desc: 'Admin approves or rejects; each action is recorded on-chain.' },
            ].map((item, i) => (
              <div
                key={i}
                className="text-center p-6 rounded-2xl bg-[var(--bg-subtle)] border border-slate-200/80 card-hover animate-fadeIn"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="w-14 h-14 bg-[var(--nepal-blue-dark)] rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-semibold text-[var(--text-primary)] mb-2">{item.title}</h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <JaggaChainLogo className="h-9 w-9" />
            <span className="font-semibold text-[var(--text-primary)] font-display">JaggaChain</span>
          </div>
          <p className="text-sm text-[var(--text-muted)]">Digital Land Registry · Government of Nepal · Powered by Solana</p>
        </div>
      </footer>
    </div>
  )

  const requireWallet = (tab) => {
    if (tab === 'explorer') return false
    return true
  }

  const canAccessTab = (tab) => {
    if (tab === 'explorer') return true
    if (!connected) return false
    if (tab === 'government') return isAdmin
    return true
  }

  return (
    <div className="min-h-screen bg-page-nepal">
      {activeTab === 'landing' && <Landing />}

      {activeTab !== 'landing' && (
        <>
          <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-[var(--nav-bg)] backdrop-blur-md" style={{ boxShadow: '0 1px 0 rgba(0,0,0,0.04)' }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16">
                <button
                  onClick={() => setActiveTab('landing')}
                  className="flex items-center gap-3 hover:opacity-80 transition"
                >
                  <JaggaChainLogo className="h-10 w-10 shrink-0" />
                  <span className="text-xl font-bold tracking-tight text-[var(--text-primary)] font-display">JaggaChain</span>
                </button>
                <div className="flex items-center gap-3">
                  {connected ? (
                    <div className="flex items-center gap-3">
                      <span className="hidden sm:block text-right">
                        <p className="text-xs font-mono text-[var(--text-muted)]">{truncateHash(walletAddress)}</p>
                        <span className={`inline-flex items-center gap-1 text-xs font-medium ${isAdmin ? 'text-amber-700' : 'text-emerald-600'}`}>
                          {isAdmin ? <><Landmark className="w-3.5 h-3.5" /> Admin</> : <><User className="w-3.5 h-3.5" /> Citizen</>}
                        </span>
                      </span>
                      <WalletMultiButton className="nav-pill nav-pill-secondary !rounded-full !px-4 !py-2 !text-sm" />
                    </div>
                  ) : (
                    <WalletMultiButton className="nav-pill nav-pill-primary !bg-[var(--nepal-blue-dark)] !text-white !rounded-full !px-5 !py-2.5" />
                  )}
                </div>
              </div>
            </div>
          </header>

          <nav className="bg-white border-b border-slate-200/80">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex gap-1">
                <button
                  onClick={() => { setActiveTab('explorer'); fetchParcels() }}
                  className={`flex items-center gap-2 px-5 py-3.5 text-sm font-semibold rounded-lg transition relative ${activeTab === 'explorer' ? 'text-[var(--nepal-blue-dark)] bg-[var(--nepal-blue)]/8' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-slate-50'}`}
                >
                  <Globe className="w-4 h-4" /> Explorer
                  {activeTab === 'explorer' && <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-[var(--nepal-blue)] rounded-full" />}
                </button>
                <button
                  onClick={() => { if (!connected) setActiveTab('parcels'); else { setActiveTab('parcels'); fetchParcelsByOwner(walletAddress) } }}
                  className={`flex items-center gap-2 px-5 py-3.5 text-sm font-semibold rounded-lg transition relative ${activeTab === 'parcels' ? 'text-[var(--nepal-blue-dark)] bg-[var(--nepal-blue)]/8' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-slate-50'}`}
                >
                  <LayoutDashboard className="w-4 h-4" /> My Portal
                  {activeTab === 'parcels' && <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-[var(--nepal-blue)] rounded-full" />}
                </button>
                {isAdmin && (
                  <button
                    onClick={() => { setActiveTab('government'); fetchWhitelist() }}
                    className={`flex items-center gap-2 px-5 py-3.5 text-sm font-semibold rounded-lg transition relative ${activeTab === 'government' ? 'text-[var(--nepal-blue-dark)] bg-[var(--nepal-blue)]/8' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-slate-50'}`}
                  >
                    <Landmark className="w-4 h-4" /> Admin
                    {activeTab === 'government' && <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-[var(--nepal-blue)] rounded-full" />}
                  </button>
                )}
              </div>
            </div>
          </nav>

          <main className="max-w-7xl mx-auto px-4 py-8">
            {activeTab === 'explorer' && (
              <div className="animate-fadeIn">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8">
                  <h2 className="text-xl font-semibold text-slate-800 mb-4 flex items-center gap-2">
                    <Search className="w-5 h-5 text-red-600" />
                    Search public land records
                  </h2>
                  <p className="text-slate-500 mb-4">No wallet required. Search by owner name, district, municipality, or tole.</p>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search by owner, district, municipality, or tole..."
                      value={searchQuery}
                      onChange={(e) => searchParcels(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition"
                    />
                  </div>
                </div>

                {!searched ? (
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-16 text-center">
                    <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Globe className="w-10 h-10 text-slate-400" />
                    </div>
                    <h2 className="text-xl font-semibold text-slate-800 mb-2">Public land registry</h2>
                    <p className="text-slate-500">Enter a search term to view land records. Wallet connection is optional here.</p>
                  </div>
                ) : parcels.length === 0 ? (
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-16 text-center">
                    <FileWarning className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-slate-800 mb-2">No records found</h2>
                    <p className="text-slate-500">No land records match your search.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {parcels.map((parcel) => (
                      <div
                        key={parcel._id}
                        className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden card-hover animate-fadeIn"
                      >
                        <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-5 py-4">
                          <div className="flex justify-between items-center">
                            <span className="text-white font-semibold">#{parcel.tokenId}</span>
                            <span className="px-2 py-1 bg-emerald-500 text-white text-xs rounded-full flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Registered
                            </span>
                          </div>
                        </div>
                        <div className="p-5">
                          <h3 className="font-semibold text-lg text-slate-800 mb-3">{parcel.ownerName}</h3>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-slate-500">Location</span>
                              <span className="text-slate-700 font-medium">
                                {parcel.location?.district}, {parcel.location?.municipality}
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
                            {parcel.transactionHash && (
                              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-1">
                                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                                <span className="text-xs text-slate-400 font-mono break-all">
                                  {truncateHash(parcel.transactionHash)}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'parcels' && (
              <div className="animate-fadeIn">
                {!connected ? (
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-16 text-center">
                    <div className="w-20 h-20 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Lock className="w-10 h-10 text-amber-600" />
                    </div>
                    <h2 className="text-xl font-semibold text-slate-800 mb-2">Connect your wallet</h2>
                    <p className="text-slate-500 mb-6">You need to connect a Solana wallet to view your parcels and transfer requests.</p>
                    <WalletMultiButton className="!bg-red-600 !text-white !rounded-xl !px-6 !py-3 hover:!bg-red-700 !inline-flex" />
                  </div>
                ) : (
                  <div>
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8">
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
                            className="flex items-center gap-2 px-4 py-2.5 bg-[#1E3A8A] text-white rounded-xl font-medium hover:bg-[#1d4ed8] transition"
                          >
                            <FileCheck className="w-4 h-4" /> Register land
                          </button>
                          <button
                            onClick={() => setShowTransferModal(true)}
                            disabled={myParcels.length === 0}
                            className="flex items-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Zap className="w-4 h-4" /> Transfer
                          </button>
                        </div>
                      </div>
                    </div>

                    {myRequests.length > 0 && (
                      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8">
                        <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                          <FileCheck className="w-5 h-5" /> My requests
                        </h3>
                        <div className="space-y-3">
                          {myRequests.map((r) => (
                            <div
                              key={r._id}
                              className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-slate-50/50"
                            >
                              <div>
                                <span className="font-medium text-slate-800">{r.requestType === 'registration' ? 'Registration' : 'Transfer'}</span>
                                <span
                                  className={`ml-2 px-2 py-0.5 rounded text-xs font-medium ${
                                    r.status === 'pending' ? 'bg-amber-100 text-amber-800' : r.status === 'approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                                  }`}
                                >
                                  {r.status}
                                </span>
                              </div>
                              <span className="text-sm text-slate-500">{new Date(r.createdAt).toLocaleDateString()}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {myParcels.length === 0 ? (
                      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-16 text-center">
                        <MapPin className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-slate-800 mb-2">No parcels yet</h2>
                        <p className="text-slate-500 mb-6">You don’t have any registered parcels. Register your first land to mint an NFT on Solana.</p>
                        <button
                          onClick={() => setShowRegisterModal(true)}
                          className="inline-flex items-center gap-2 px-6 py-3 bg-[#1E3A8A] text-white rounded-xl font-medium hover:bg-[#1d4ed8] transition"
                        >
                          <FileCheck className="w-4 h-4" /> Register land
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {myParcels.map((parcel) => (
                          <div
                            key={parcel._id}
                            className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 card-hover"
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
                                  {parcel.location?.municipality}, Ward {parcel.location?.ward}, {parcel.location?.tole}
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

            {activeTab === 'government' && !isAdmin && connected && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-16 text-center animate-fadeIn">
                <Landmark className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-slate-800 mb-2">Admin access required</h2>
                <p className="text-slate-500 mb-6">This area is only available to authorized government wallets.</p>
                <button onClick={() => setActiveTab('explorer')} className="text-red-600 font-medium hover:underline">Go to Explorer</button>
              </div>
            )}

            {activeTab === 'government' && isAdmin && (
              <div className="animate-fadeIn">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 card-hover">
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
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 card-hover">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-amber-100">
                        <FileCheck className="w-8 h-8 text-amber-600" />
                      </div>
                      <div>
                        <p className="text-3xl font-bold text-slate-800">{registrationRequests.length}</p>
                        <p className="text-sm text-slate-500">Pending registrations</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 card-hover">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-blue-100">
                        <Zap className="w-8 h-8 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-3xl font-bold text-slate-800">{transferRequests.length}</p>
                        <p className="text-sm text-slate-500">Pending transfers</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-8">
                  <div className="bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] px-6 py-4">
                    <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                      <FileCheck className="w-5 h-5" /> Registration requests
                    </h2>
                    <p className="text-blue-200 text-sm">Review and approve or reject. Each action is recorded on Solana.</p>
                  </div>
                  {registrationRequests.length === 0 ? (
                    <div className="p-8 text-center text-slate-500">No pending registration requests.</div>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {registrationRequests.map((item) => (
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
                                {item.location && (
                                  <p className="text-sm text-slate-500">
                                    {item.location.district}, {item.location.municipality}
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
                                    className="flex items-center gap-1 px-4 py-2 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition text-sm"
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
                                  <div><span className="text-slate-500">Owner name</span><br /><span className="font-medium text-slate-800">{item.ownerName}</span></div>
                                  <div><span className="text-slate-500">Wallet</span><br /><span className="font-mono text-slate-800 break-all">{item.walletAddress}</span></div>
                                  <div><span className="text-slate-500">District</span><br /><span className="text-slate-800">{item.location?.district}</span></div>
                                  <div><span className="text-slate-500">Municipality</span><br /><span className="text-slate-800">{item.location?.municipality}</span></div>
                                  <div><span className="text-slate-500">Ward</span><br /><span className="text-slate-800">{item.location?.ward}</span></div>
                                  <div><span className="text-slate-500">Tole</span><br /><span className="text-slate-800">{item.location?.tole}</span></div>
                                  <div><span className="text-slate-500">Size</span><br /><span className="text-slate-800">{formatSize(item.size)}</span></div>
                                  <div><span className="text-slate-500">Submitted</span><br /><span className="text-slate-800">{new Date(item.createdAt).toLocaleString()}</span></div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="bg-gradient-to-r from-red-700 to-red-600 px-6 py-4">
                    <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                      <Zap className="w-5 h-5" /> Transfer requests
                    </h2>
                    <p className="text-red-200 text-sm">Approve or reject; each decision is recorded on Solana.</p>
                  </div>
                  {transferRequests.length === 0 ? (
                    <div className="p-8 text-center text-slate-500">No pending transfer requests.</div>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {transferRequests.map((item) => (
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
                                {item.toName && (
                                  <p className="text-sm text-slate-500">
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
                                    className="flex items-center gap-1 px-4 py-2 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition text-sm"
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
                                  <div><span className="text-slate-500">From (owner)</span><br /><span className="font-medium text-slate-800">{item.ownerName}</span></div>
                                  <div><span className="text-slate-500">From wallet</span><br /><span className="font-mono text-slate-800 break-all">{item.walletAddress}</span></div>
                                  <div><span className="text-slate-500">To (recipient)</span><br /><span className="text-slate-800">{item.toName}</span></div>
                                  <div><span className="text-slate-500">To wallet</span><br /><span className="font-mono text-slate-800 break-all">{item.toWallet}</span></div>
                                  <div><span className="text-slate-500">Parcel ID</span><br /><span className="font-mono text-slate-800">{item.parcelId}</span></div>
                                  <div><span className="text-slate-500">Submitted</span><br /><span className="text-slate-800">{new Date(item.createdAt).toLocaleString()}</span></div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </main>
        </>
      )}

      {showRegisterModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowRegisterModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-red-600" /> Register new land
            </h2>
            <form onSubmit={handleRegistration} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Owner name</label>
                <input
                  required
                  type="text"
                  value={registerForm.ownerName}
                  onChange={(e) => setRegisterForm({ ...registerForm, ownerName: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">District</label>
                  <input
                    required
                    type="text"
                    value={registerForm.district}
                    onChange={(e) => setRegisterForm({ ...registerForm, district: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Municipality</label>
                  <input
                    required
                    type="text"
                    value={registerForm.municipality}
                    onChange={(e) => setRegisterForm({ ...registerForm, municipality: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Ward</label>
                  <input
                    required
                    type="number"
                    value={registerForm.ward}
                    onChange={(e) => setRegisterForm({ ...registerForm, ward: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tole</label>
                  <input
                    required
                    type="text"
                    value={registerForm.tole}
                    onChange={(e) => setRegisterForm({ ...registerForm, tole: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Bigha</label>
                  <input
                    type="number"
                    value={registerForm.bigha}
                    onChange={(e) => setRegisterForm({ ...registerForm, bigha: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Kattha</label>
                  <input
                    type="number"
                    value={registerForm.kattha}
                    onChange={(e) => setRegisterForm({ ...registerForm, kattha: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Dhur</label>
                  <input
                    type="number"
                    value={registerForm.dhur}
                    onChange={(e) => setRegisterForm({ ...registerForm, dhur: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 outline-none"
                  />
                </div>
              </div>
              <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl">
                <p className="text-sm text-blue-800 flex items-center gap-2">
                  <Zap className="w-4 h-4 shrink-0" />
                  After government approval, an NFT will be minted on Solana and the record will be visible on Explorer. A small fee may apply.
                </p>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRegisterModal(false)}
                  className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={txLoading === 'registering'}
                  className="flex-1 px-4 py-2.5 bg-[#1E3A8A] text-white rounded-xl font-medium hover:bg-[#1d4ed8] transition disabled:opacity-50 inline-flex items-center justify-center gap-2"
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
            className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-red-600" /> Transfer parcel
            </h2>
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
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition disabled:opacity-50 inline-flex items-center justify-center gap-2"
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
