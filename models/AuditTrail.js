// models/AuditTrail.js

import mongoose from 'mongoose';

const AuditTrailSchema = new mongoose.Schema({
    evidenceId: { type: Number, required: true },
    actions: [
        {
            actionType: String,
            timestamp: { type: Date, default: Date.now },
            userAddress: String,
            details: String,
            transactionHash: String,
            blockNumber: Number,
        },
    ],
});

export default mongoose.models.AuditTrail || mongoose.model('AuditTrail', AuditTrailSchema);
