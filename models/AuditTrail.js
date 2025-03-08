// models/AuditTrail.js
const mongoose = require('mongoose');

const AuditActionSchema = new mongoose.Schema({
    actionType: { type: String, required: true },
    timestamp: { type: Date, required: true },
    userAddress: { type: String, required: true },
    details: { type: String, required: true },
    transactionHash: { type: String, default: "" },
    blockNumber: { type: Number, default: 0 },
    approval: {
        pending: { type: Boolean, default: false },
        approved: { type: Boolean, default: false },
        receiver: { type: String, default: "" },
        approvedBy: { type: String, default: "" },
        approvedAt: { type: Date, default: null }
    },
    // New field for storing the analysis document URL
    analysisDocumentUrl: { type: String, default: "" }
});

const AuditTrailSchema = new mongoose.Schema({
    evidenceId: { type: Number, required: true, unique: true },
    actions: [AuditActionSchema],
});

module.exports = mongoose.models.AuditTrail || mongoose.model('AuditTrail', AuditTrailSchema);
