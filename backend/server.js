require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const solana = require('./solana');

const app = express();
app.use(cors());
app.use(express.json());

// Fee config: Citizen 0.02, Land Revenue Officer (proposal) 0.05, Chief Land Revenue Officer (approve/reject) 0.08
const FEE_CITIZEN_SOL = parseFloat(process.env.FEE_CITIZEN_SOL || '0.02');
const FEE_LRO_SOL = parseFloat(process.env.FEE_LRO_SOL || '0.05');
const FEE_CLRO_SOL = parseFloat(process.env.FEE_CLRO_SOL || '0.08');
const TREASURY_WALLET = process.env.TREASURY_WALLET || '';
const ENABLE_DEMO_SEED = process.env.ENABLE_DEMO_SEED === 'true';

const MONGO_URI = 'mongodb+srv://sachinacharya365official_db_user:kEX4fEHa1FNjVyWt@cluster0.k8tooiv.mongodb.net/onChain-Jagga';

mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

const parcelSchema = new mongoose.Schema({
  tokenId: Number,
  ownerName: String,
  ownerWallet: String,
  location: {
    province: String,
    district: String,
    municipality: String,
    ward: Number,
    tole: String
  },
  size: {
    bigha: Number,
    kattha: Number,
    dhur: Number
  },
  documentHash: String,
  transactionHash: String,
  mintAddress: String,
  status: { type: String, default: 'registered' },
  // Three transactions from registration approval flow (for Public Records detail)
  citizenTxSignature: String,      // User (Citizen) transaction
  lroProposalTxSignature: String,  // Land Revenue Officer (मालपोत अधिकृत) proposal tx
  clroDecisionTxSignature: String, // Chief Land Revenue Officer (प्रमुख मालपोत अधिकृत) approve/reject tx
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const whitelistSchema = new mongoose.Schema({
  walletAddress: String,
  ownerName: String,
  requestType: { type: String, default: 'whitelist' },
  status: { type: String, default: 'pending' },
  location: {
    province: String,
    district: String,
    municipality: String,
    ward: Number,
    tole: String
  },
  size: {
    bigha: Number,
    kattha: Number,
    dhur: Number
  },
  toWallet: String,
  toName: String,
  parcelId: String,
  paymentTxSignature: String,         // citizen SOL fee tx (proof of payment)
  lroProposalTxSignature: String,    // Land Revenue Officer SOL fee tx when proposing (0.05 SOL)
  adminPaymentTxSignature: String,   // Chief Land Revenue Officer SOL fee tx when approve/reject (0.08 SOL)
  nftTransferSignature: String,      // real NFT transfer to escrow tx
  createdAt: { type: Date, default: Date.now }
});

const Parcel = mongoose.model('Parcel', parcelSchema);
const Whitelist = mongoose.model('Whitelist', whitelistSchema);

app.get('/api/parcels', async (req, res) => {
  try {
    const parcels = await Parcel.find().sort({ createdAt: -1 });
    res.json(parcels);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/parcels/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.json([]);
    }
    const regex = new RegExp(q, 'i');
    const parcels = await Parcel.find({
      $or: [
        { ownerName: regex },
        { 'location.province': regex },
        { 'location.district': regex },
        { 'location.municipality': regex },
        { 'location.tole': regex }
      ]
    }).sort({ createdAt: -1 });
    res.json(parcels);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/parcels/:id', async (req, res) => {
  try {
    const parcel = await Parcel.findById(req.params.id);
    if (!parcel) return res.status(404).json({ error: 'Parcel not found' });
    res.json(parcel);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get the three Solana tx signatures for a parcel (from approved registration whitelist). Backfills parcel if missing.
app.get('/api/parcels/:id/registration-proof', async (req, res) => {
  try {
    const parcel = await Parcel.findById(req.params.id);
    if (!parcel) return res.status(404).json({ error: 'Parcel not found' });
    const hasAll = parcel.citizenTxSignature && parcel.lroProposalTxSignature && parcel.clroDecisionTxSignature;
    if (hasAll) {
      return res.json({
        citizenTxSignature: parcel.citizenTxSignature,
        lroProposalTxSignature: parcel.lroProposalTxSignature,
        clroDecisionTxSignature: parcel.clroDecisionTxSignature
      });
    }
    const approved = await Whitelist.findOne({
      status: 'approved',
      requestType: 'registration',
      walletAddress: parcel.ownerWallet,
      ownerName: parcel.ownerName
    }).sort({ createdAt: -1 });
    if (!approved) {
      return res.json({
        citizenTxSignature: parcel.citizenTxSignature || null,
        lroProposalTxSignature: parcel.lroProposalTxSignature || null,
        clroDecisionTxSignature: parcel.clroDecisionTxSignature || null
      });
    }
    const citizenTxSignature = parcel.citizenTxSignature || approved.paymentTxSignature || null;
    const lroProposalTxSignature = parcel.lroProposalTxSignature || approved.lroProposalTxSignature || null;
    const clroDecisionTxSignature = parcel.clroDecisionTxSignature || approved.adminPaymentTxSignature || null;
    if (!parcel.citizenTxSignature || !parcel.lroProposalTxSignature || !parcel.clroDecisionTxSignature) {
      await Parcel.findByIdAndUpdate(req.params.id, {
        citizenTxSignature: citizenTxSignature || parcel.citizenTxSignature,
        lroProposalTxSignature: lroProposalTxSignature || parcel.lroProposalTxSignature,
        clroDecisionTxSignature: clroDecisionTxSignature || parcel.clroDecisionTxSignature
      });
    }
    res.json({ citizenTxSignature, lroProposalTxSignature, clroDecisionTxSignature });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/parcels/owner/:wallet', async (req, res) => {
  try {
    const parcels = await Parcel.find({ ownerWallet: req.params.wallet }).sort({ createdAt: -1 });
    res.json(parcels);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/fee-config', (req, res) => {
  res.json({
    citizenFeeSol: FEE_CITIZEN_SOL,
    lroFeeSol: FEE_LRO_SOL,
    clroFeeSol: FEE_CLRO_SOL,
    treasuryWallet: TREASURY_WALLET,
    solanaConfigured: solana.isConfigured
  });
});

// Fee tx via backend so frontend does not need Solana RPC (avoids "network unreachable" in browser)
app.post('/api/solana/build-registration-tx', async (req, res) => {
  try {
    const { fromPubkey, toPubkey, lamports, payload } = req.body;
    if (!fromPubkey || !toPubkey || lamports == null || !payload) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }
    const transaction = await solana.buildRegistrationTx(fromPubkey, toPubkey, lamports, payload);
    res.json({ transaction });
  } catch (err) {
    if (err.message && err.message.includes('not configured')) {
      return res.status(503).json({ error: 'Solana RPC not configured. Set SOLANA_RPC_URL in backend .env' });
    }
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/solana/build-fee-tx', async (req, res) => {
  try {
    const { fromPubkey, toPubkey, lamports } = req.body;
    if (!fromPubkey || !toPubkey || lamports == null) {
      return res.status(400).json({ error: 'Missing fromPubkey, toPubkey, or lamports' });
    }
    const transaction = await solana.buildFeeTransferTx(fromPubkey, toPubkey, lamports);
    res.json({ transaction });
  } catch (err) {
    if (err.message && err.message.includes('not configured')) {
      return res.status(503).json({ error: 'Solana RPC not configured. Set SOLANA_RPC_URL in backend .env' });
    }
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/solana/build-nft-transfer-tx', async (req, res) => {
  try {
    const { mintAddress, fromPubkey, toPubkey } = req.body;
    if (!mintAddress || !fromPubkey || !toPubkey) {
      return res.status(400).json({ error: 'Missing mintAddress, fromPubkey, or toPubkey' });
    }
    const transaction = await solana.buildNFTTransferTx(mintAddress, fromPubkey, toPubkey);
    res.json({ transaction });
  } catch (err) {
    if (err.message && err.message.includes('not configured')) {
      return res.status(503).json({ error: 'Solana RPC not configured. Set SOLANA_RPC_URL in backend .env' });
    }
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/solana/submit-signed-tx', async (req, res) => {
  try {
    const { signedTransaction } = req.body;
    if (!signedTransaction) return res.status(400).json({ error: 'Missing signedTransaction (base64)' });
    const signature = await solana.submitSignedTx(signedTransaction);
    res.json({ signature });
  } catch (err) {
    if (err.message && err.message.includes('not configured')) {
      return res.status(503).json({ error: 'Solana RPC not configured' });
    }
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/whitelist', async (req, res) => {
  try {
    const requests = await Whitelist.find().sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/whitelist', async (req, res) => {
  try {
    const { walletAddress, ownerName, requestType, location, size, toWallet, toName, parcelId, paymentTxSignature, nftTransferSignature } = req.body;
    if (!paymentTxSignature) {
      return res.status(400).json({ error: 'Payment required. Send SOL fee first and include paymentTxSignature.' });
    }
    const request = new Whitelist({
      walletAddress,
      ownerName,
      requestType: requestType || 'whitelist',
      location,
      size,
      toWallet,
      toName,
      parcelId,
      paymentTxSignature,
      nftTransferSignature // Real NFT transfer to escrow (optional if dev-mode)
    });
    await request.save();
    res.json(request);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Land Revenue Officer: propose (move pending → proposed). Pays 0.05 SOL.
app.put('/api/whitelist/:id/propose', async (req, res) => {
  try {
    const { paymentTxSignature } = req.body;
    if (!paymentTxSignature) {
      return res.status(400).json({ error: 'LRO payment required. Send SOL fee first and include paymentTxSignature.' });
    }
    const existing = await Whitelist.findById(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Request not found' });
    if (existing.status !== 'pending') {
      return res.status(400).json({ error: 'Only pending requests can be proposed.' });
    }
    const request = await Whitelist.findByIdAndUpdate(
      req.params.id,
      { status: 'proposed', lroProposalTxSignature: paymentTxSignature },
      { new: true }
    );
    res.json(request);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Chief Land Revenue Officer: approve or reject (proposed → approved/rejected). Pays 0.08 SOL.
app.put('/api/whitelist/:id', async (req, res) => {
  try {
    const { status, paymentTxSignature } = req.body;
    if (!status || !paymentTxSignature) {
      return res.status(400).json({ error: 'CLRO payment required. Send SOL fee first and include status and paymentTxSignature.' });
    }
    if (status !== 'approved' && status !== 'rejected') {
      return res.status(400).json({ error: 'Status must be approved or rejected.' });
    }
    const existing = await Whitelist.findById(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Request not found' });
    if (existing.status !== 'proposed') {
      return res.status(400).json({ error: 'Only proposed requests can be approved or rejected.' });
    }
    const request = await Whitelist.findByIdAndUpdate(
      req.params.id,
      { status, adminPaymentTxSignature: paymentTxSignature },
      { new: true }
    );

    // Record approve/reject on Solana (memo)
    const recordType = request.requestType === 'registration' ? 'REGISTRATION' : 'TRANSFER';
    const txHash = await solana.recordApprovalRejection(recordType, request._id.toString(), status);

    if (status === 'approved' && request.requestType === 'registration') {
      const tokenId = (await Parcel.countDocuments()) + 1;
      const { mintAddress: mintAddr, signature: mintSig } = await solana.mintParcelNFT(
        request.walletAddress,
        tokenId,
        request.ownerName,
        request.location?.district || '',
        request.location?.municipality || ''
      );
      const regTxHash = await solana.recordRegistration({
        tokenId,
        ownerWallet: request.walletAddress,
        ownerName: request.ownerName,
        district: request.location?.district || '',
        municipality: request.location?.municipality || ''
      });
      const newParcel = new Parcel({
        tokenId,
        ownerName: request.ownerName,
        ownerWallet: request.walletAddress,
        location: request.location,
        size: request.size,
        documentHash: 'Qm' + Date.now(),
        transactionHash: mintSig || regTxHash,
        mintAddress: mintAddr || undefined,
        status: 'registered',
        citizenTxSignature: request.paymentTxSignature || undefined,
        lroProposalTxSignature: request.lroProposalTxSignature || undefined,
        clroDecisionTxSignature: request.adminPaymentTxSignature || undefined
      });
      await newParcel.save();
    }

    if (status === 'approved' && request.requestType === 'transfer' && request.parcelId) {
      const parcel = await Parcel.findById(request.parcelId);
      if (parcel && parcel.mintAddress && solana.isConfigured) {
        // Real SPL Transfer from Treasury to Buyer
        const transferTxHash = await solana.transferParcelNFT(
          parcel.mintAddress,
          TREASURY_WALLET || (await solana.getProtocolPublicKey()), // From treasury
          request.toWallet
        );
        parcel.ownerWallet = request.toWallet;
        parcel.ownerName = request.toName;
        parcel.transactionHash = transferTxHash;
        parcel.updatedAt = new Date();
        await parcel.save();
      } else if (parcel) {
        // Dev mode / Fallback
        const transferTxHash = await solana.recordTransfer({
          parcelId: request.parcelId,
          fromWallet: request.walletAddress,
          toWallet: request.toWallet || '',
          toName: request.toName || ''
        });
        parcel.ownerWallet = request.toWallet;
        parcel.ownerName = request.toName;
        parcel.transactionHash = transferTxHash;
        parcel.updatedAt = new Date();
        await parcel.save();
      }
    }

    if (status === 'rejected' && request.requestType === 'transfer' && request.parcelId) {
      // Refund NFT to Seller
      const parcel = await Parcel.findById(request.parcelId);
      if (parcel && parcel.mintAddress && solana.isConfigured) {
        await solana.transferParcelNFT(
          parcel.mintAddress,
          TREASURY_WALLET || (await solana.getProtocolPublicKey()),
          request.walletAddress
        );
      }
    }

    res.json(request);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/stats', async (req, res) => {
  try {
    const totalParcels = await Parcel.countDocuments();
    const pendingCount = await Whitelist.countDocuments({ status: 'pending' });
    const proposedCount = await Whitelist.countDocuments({ status: 'proposed' });
    const pendingRegistrations = await Whitelist.countDocuments({ status: 'pending', requestType: 'registration' });
    const pendingTransfers = await Whitelist.countDocuments({ status: 'pending', requestType: 'transfer' });
    const approvedWhitelist = await Whitelist.countDocuments({ status: 'approved' });
    res.json({
      totalParcels,
      pendingRegistrations,
      pendingTransfers,
      pendingCount,
      proposedCount,
      approvedWhitelist
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Remove only parcels #1 and #5 of Sachin Acharya (and related whitelist entries)
app.post('/api/admin/cleanup-dummy', async (req, res) => {
  try {
    const parcelCondition = {
      ownerName: /sachin acharya/i,
      tokenId: { $in: [1, 5] }
    };
    const parcelsToRemove = await Parcel.find(parcelCondition).select('_id');
    const parcelIds = parcelsToRemove.map((p) => p._id.toString());

    const parcelResult = await Parcel.deleteMany(parcelCondition);
    const whitelistResult = await Whitelist.deleteMany({
      parcelId: { $in: parcelIds }
    });

    res.json({
      ok: true,
      parcelsDeleted: parcelResult.deletedCount,
      whitelistDeleted: whitelistResult.deletedCount
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const seedData = async () => {
  const count = await Parcel.countDocuments();
  if (count === 0) {
    const parcels = [
      {
        tokenId: 1,
        ownerName: 'Sachin Acharya',
        ownerWallet: 'G6DKYcQnySUk1ZYYuR1HMovVscWjAtyDQb6GhqrvJYnw',
        location: {
          province: 'Bagmati',
          district: 'Kathmandu',
          municipality: 'Kathmandu Metropolitan',
          ward: 10,
          tole: 'Thamel'
        },
        size: { bigha: 0, kattha: 5, dhur: 2 },
        documentHash: 'Qm1234567890abcdef',
        transactionHash: '5J4rQqyX9z1L3m5n7p2q8r4t6y8u0i1o2p3a4s5d6f7g8h9j0k1l2m3n4o5p6',
        status: 'registered'
      },
      {
        tokenId: 2,
        ownerName: 'Hari Prasad Shah',
        ownerWallet: 'sDHAt4sfn556SXvKddXjCwAeKaMpLHEKKWcfG7hfmoz',
        location: {
          province: 'Bagmati',
          district: 'Lalitpur',
          municipality: 'Lalitpur Metropolitan',
          ward: 5,
          tole: 'Patan'
        },
        size: { bigha: 1, kattha: 2, dhur: 5 },
        documentHash: 'Qm0987654321fedcba',
        transactionHash: '6K5sR0z2A4m6n8o0p1q2r3s4t5u6v7w8x9y0z1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6',
        status: 'registered'
      },
      {
        tokenId: 3,
        ownerName: 'Gagan Sher Shah',
        ownerWallet: '8b29vHx8ZdAQp9vNSLSgmNxeqgPZbyqE6paPdwVvXYSB',
        location: {
          province: 'Province 1',
          district: 'Birtamode',
          municipality: 'Birtamode Municipality',
          ward: 8,
          tole: 'Mahendra Chowk'
        },
        size: { bigha: 2, kattha: 0, dhur: 0 },
        documentHash: 'Qmabcdef1234567890',
        transactionHash: '7L6tS1a3B5n7o9p1q2r3s4t5u6v7w8x9y0z1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7',
        status: 'registered'
      }
    ];

    await Parcel.insertMany(parcels);
    console.log('Parcels seeded');

    await Whitelist.deleteMany({});
    console.log('Whitelist cleared');
  }
};

if (ENABLE_DEMO_SEED) {
  seedData();
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
