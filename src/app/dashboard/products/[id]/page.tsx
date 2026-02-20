import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import ProductDetailDashboard from '@/components/ProductDetailDashboard';

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const session = await getSession();

    if (!session || !session.userId) {
        redirect('/login');
    }

    const user = await prisma.user.findUnique({
        where: { id: session.userId as string },
        select: { id: true, email: true, credits: true, role: true },
    });

    if (!user) {
        redirect('/login');
    }

    const resolvedParams = await params;

    const product = await prisma.product.findUnique({
        where: {
            id: resolvedParams.id,
            userId: session.userId as string,
        },
    });

    if (!product) {
        redirect('/dashboard/products');
    }

    // Convert date objects to strings for Client Component
    const serializedProduct = {
        ...product,
        createdAt: product.createdAt.toISOString(),
        updatedAt: product.updatedAt.toISOString(),
    };

    return <ProductDetailDashboard user={user} product={serializedProduct} />;
}
