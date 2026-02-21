import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { jwtVerify } from 'jose';

export async function proxy(request: NextRequest) {
    const sessionCookie = request.cookies.get('auth-token');

    // Check if the route is protected
    const isProtectedRoute = request.nextUrl.pathname.startsWith('/dashboard') || request.nextUrl.pathname.startsWith('/admin');

    if (isProtectedRoute && !sessionCookie?.value) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    let payload: { userId: string; role?: string } | null = null;

    if (sessionCookie?.value) {
        try {
            const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'super-secret-key-for-development-only');
            const { payload: decoded } = await jwtVerify(sessionCookie.value, secret);
            payload = decoded as { userId: string; role?: string };
        } catch (error) {
            // Invalid token
            if (isProtectedRoute) {
                const response = NextResponse.redirect(new URL('/login', request.url));
                response.cookies.delete('auth-token');
                return response;
            }
        }
    }

    // Redirect to dashboard if logged in and trying to access login/register
    if (
        request.nextUrl.pathname === '/login' ||
        request.nextUrl.pathname === '/register'
    ) {
        if (payload) {
            return NextResponse.redirect(new URL('/dashboard', request.url));
        }
    }

    // Admin route guard
    if (request.nextUrl.pathname.startsWith('/admin')) {
        if (!payload || payload.role !== 'ADMIN') {
            return NextResponse.redirect(new URL('/dashboard', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/dashboard/:path*', '/admin/:path*', '/login', '/register'],
};
