// app/api/auditTrail/approve/route.js

import { NextResponse } from 'next/server';
import dbConnect from '@/utils/dbConnect';
import AuditTrail from '@/models/AuditTrail';

export async function PATCH(request) {
    await dbConnect();

    try {
        // Extract parameters from the request body
        const { evidenceId, transactionHash, approver } = await request.json();
        const evidenceIdNum = Number(evidenceId);
        console.log('Approving custody transfer:', evidenceIdNum, transactionHash, approver);
        // Find the audit trail for the given evidenceId
        const auditTrail = await AuditTrail.findOne({ evidenceId: evidenceIdNum });
        if (!auditTrail) {
            return NextResponse.json(
                { success: false, error: 'Audit trail not found' },
                { status: 404 }
            );
        }

        // Find the audit action by matching the transactionHash
        const action = auditTrail.actions.find(
            (action) => action.transactionHash === transactionHash
        );
        if (!action) {
            return NextResponse.json(
                { success: false, error: 'Audit action not found' },
                { status: 404 }
            );
        }

        // Check if the action is pending approval for a custody transfer
        if (!action.approval || !action.approval.pending) {
            return NextResponse.json(
                { success: false, error: 'Audit action is not pending approval' },
                { status: 400 }
            );
        }

        // Verify that the approver matches the receiver stored in the audit action
        if (action.approval.receiver.toLowerCase() !== approver.toLowerCase()) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized: Approver does not match receiver' },
                { status: 403 }
            );
        }

        // Update the approval fields
        action.approval.pending = false;
        action.approval.approved = true;
        action.approval.approvedBy = approver;
        action.approval.approvedAt = new Date();

        // Save the updated audit trail document
        await auditTrail.save();

        return NextResponse.json({ success: true, data: action }, { status: 200 });
    } catch (error) {
        console.error('Error updating audit approval:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
