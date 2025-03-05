// models/AuditTrail.js

import mongoose from 'mongoose';

const AuditActionSchema = new mongoose.Schema({
    actionType: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    userAddress: { type: String, required: true },
    details: { type: String, required: true },
    transactionHash: String,
    blockNumber: Number,
    approval: {
        pending: { type: Boolean, default: false },
        approved: { type: Boolean, default: false },
        receiver: { type: String, default: "" },
        approvedBy: { type: String, default: "" },
        approvedAt: Date,
    },
});

const AuditTrailSchema = new mongoose.Schema({
    evidenceId: { type: Number, required: true },
    actions: [AuditActionSchema],
});

export default mongoose.models.AuditTrail || mongoose.model('AuditTrail', AuditTrailSchema);
