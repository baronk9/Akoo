import { NextResponse } from 'next/server';
import { clearSession } from '@/lib/auth';

export async function POST() {
    try {
        await clearSession();
        return NextResponse.json({ success: true, message: 'Logged out' });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Failed to clear session' }, { status: 500 });
    }
}
