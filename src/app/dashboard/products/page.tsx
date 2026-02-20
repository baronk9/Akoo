import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import ProductsDashboard from '@/components/ProductsDashboard';

export default async function ProductsPage() {
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

    return <ProductsDashboard user={user} />;
}
