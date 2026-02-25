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

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getSession();
        if (!session || !session.userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const resolvedParams = await params;

        // Try to delete the product, ensuring the user owns it
        await prisma.product.delete({
            where: {
                id: resolvedParams.id,
                userId: session.userId as string,
            },
        });

        return NextResponse.json({ success: true, message: 'Product deleted successfully' });
    } catch (error) {
        // Prisma throws an error if the record to delete does not exist (e.g. invalid ID or wrong user)
        console.error('Failed to delete product:', error);
        return NextResponse.json({ error: 'Failed to delete product or product not found' }, { status: 500 });
    }
}
