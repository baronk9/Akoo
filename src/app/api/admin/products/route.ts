import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const session = await getSession();
        if (!session || session.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Forbidden. Admin access required.' }, { status: 403 });
        }

        const products = await prisma.product.findMany({
            select: {
                id: true,
                name: true,
                createdAt: true,
                user: {
                    select: {
                        email: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return NextResponse.json({ products });
    } catch (error) {
        console.error('Failed to fetch all products:', error);
        return NextResponse.json({ error: 'Internal server error while fetching products' }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const session = await getSession();
        if (!session || session.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Forbidden. Admin access required.' }, { status: 403 });
        }

        const url = new URL(req.url);
        const productId = url.searchParams.get('id');

        if (!productId) {
            return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
        }

        await prisma.product.delete({
            where: { id: productId },
        });

        return NextResponse.json({ message: 'Product deleted successfully', success: true });
    } catch (error) {
        console.error('Failed to delete product:', error);
        return NextResponse.json({ error: 'Internal server error while deleting product' }, { status: 500 });
    }
}
