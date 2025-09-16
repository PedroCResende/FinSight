import { NextResponse, NextRequest } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
    try {
        const { token } = await request.json();
        const cookieStore = cookies();

        if (token) {
            // Set the cookie
            cookieStore.set('firebaseIdToken', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                path: '/',
                maxAge: 60 * 60 * 24, // 24 hours
            });
        } else {
            // Clear the cookie
            cookieStore.delete('firebaseIdToken');
        }

        return NextResponse.json({ success: true }, { status: 200 });

    } catch (error) {
        return NextResponse.json({ success: false, error: 'Failed to set auth cookie' }, { status: 500 });
    }
}
