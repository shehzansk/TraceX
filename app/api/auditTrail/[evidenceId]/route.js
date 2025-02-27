// app/api/auditTrail/[evidenceId]/route.js

import { NextResponse } from 'next/server';
import dbConnect from '@/utils/dbConnect';
import AuditTrail from '@/models/AuditTrail';

export async function GET(request, { params }) {
    const { evidenceId } = params;

    await dbConnect();

    try {
        const auditTrail = await AuditTrail.findOne({ evidenceId });
        if (!auditTrail) {
            return NextResponse.json({ success: false, error: 'Audit trail not found' }, { status: 404 });
        }
        return NextResponse.json({ success: true, data: auditTrail }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
