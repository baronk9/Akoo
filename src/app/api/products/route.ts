import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const session = await getSession();
        if (!session || !session.userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const products = await prisma.product.findMany({
            where: {
                userId: session.userId as string,
            },
            orderBy: {
                createdAt: 'desc',
            },
            select: {
                id: true,
                name: true,
                createdAt: true,
                updatedAt: true,
                // We only need basic metadata for the list view, not the heavy text content
            }
        });

        return NextResponse.json({ products });
    } catch (error) {
        console.error('Failed to fetch products:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
