import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import DashboardWizard from '@/components/DashboardWizard';

export default async function NewProjectPage({
    searchParams,
}: {
    searchParams: Promise<{ name?: string }>;
}) {
    const session = await getSession();

    if (!session || !session.userId) {
        redirect('/login');
    }

    const resolvedParams = await searchParams;
    const initialProjectName = resolvedParams.name;

    const user = await prisma.user.findUnique({
        where: { id: session.userId as string },
        select: { id: true, email: true, credits: true, role: true },
    });

    if (!user) {
        redirect('/login');
    }

    return <DashboardWizard user={user} initialProjectName={initialProjectName} />;
}
