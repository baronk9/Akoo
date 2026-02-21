import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getSession();
        if (!session || !session.userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const resolvedParams = await params;

        const product = await prisma.product.findUnique({
            where: {
                id: resolvedParams.id,
                userId: session.userId as string,
            },
        });

        if (!product) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        return NextResponse.json({ product });
    } catch (error) {
        console.error('Failed to fetch product:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getSession();
        if (!session || !session.userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { name } = await req.json();

        if (!name) {
            return NextResponse.json({ error: 'Name is required' }, { status: 400 });
        }

        const resolvedParams = await params;

        const product = await prisma.product.update({
            where: {
                id: resolvedParams.id,
                userId: session.userId as string, // Ensure user owns the product
            },
            data: {
                name,
            },
        });

        return NextResponse.json({ product });
    } catch (error) {
        console.error('Failed to update product:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
