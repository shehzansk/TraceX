// app/api/auditTrail/route.js

import { NextResponse } from 'next/server';
import dbConnect from '@/utils/dbConnect';
import AuditTrail from '@/models/AuditTrail';

export async function POST(request) {
    await dbConnect();

    try {
        const body = await request.json();
        const { evidenceId, actions } = body;

        // Input validation
        if (!evidenceId || !Array.isArray(actions) || actions.length === 0) {
            return NextResponse.json({ success: false, error: 'Invalid data format' }, { status: 400 });
        }

        // Check if audit trail exists for this evidenceId
        let auditTrail = await AuditTrail.findOne({ evidenceId });

        if (auditTrail) {
            // Append new actions to existing audit trail
            auditTrail.actions.push(...actions);
        } else {
            // For new evidence, create new audit trail document
            auditTrail = new AuditTrail({ evidenceId, actions });
        }

        await auditTrail.save();
        return NextResponse.json({ success: true, data: auditTrail }, { status: 201 });
    } catch (error) {
        console.error('Error saving audit trail:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
