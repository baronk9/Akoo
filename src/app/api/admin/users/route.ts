import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        const session = await getSession();
        if (!session || session.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Forbidden. Admin access required.' }, { status: 403 });
        }

        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                role: true,
                credits: true,
                createdAt: true,
                _count: {
                    select: { products: true }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return NextResponse.json({ users });
    } catch (error) {
        console.error('Failed to fetch admin users:', error);
        return NextResponse.json({ error: 'Internal server error while fetching users' }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const session = await getSession();
        if (!session || session.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Forbidden. Admin access required.' }, { status: 403 });
        }

        const body = await req.json();
        const { userId, credits, role } = body;

        if (!userId) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
        }

        const updateData: any = {};
        if (typeof credits === 'number') updateData.credits = credits;
        if (role === 'USER' || role === 'ADMIN') updateData.role = role;

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: updateData,
            select: {
                id: true,
                email: true,
                role: true,
                credits: true,
            }
        });

        return NextResponse.json({ message: 'User updated successfully', user: updatedUser });
    } catch (error) {
        console.error('Failed to update user:', error);
        return NextResponse.json({ error: 'Internal server error while updating user' }, { status: 500 });
    }
}
