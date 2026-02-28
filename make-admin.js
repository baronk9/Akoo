/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const emailToPromote = 'supabase_test@test.com'; // User created in previous test

    try {
        const user = await prisma.user.update({
            where: { email: emailToPromote },
            data: { role: 'ADMIN' },
        });
        console.log(`Successfully promoted ${user.email} to ADMIN.`);
    } catch (error) {
        if (error.code === 'P2025') {
            console.log(`User ${emailToPromote} not found. Promoting the first available user...`);
            const firstUser = await prisma.user.findFirst();
            if (firstUser) {
                const promoted = await prisma.user.update({
                    where: { id: firstUser.id },
                    data: { role: 'ADMIN' }
                });
                console.log(`Successfully promoted ${promoted.email} to ADMIN.`);
            } else {
                console.log("No users exist in the database yet to promote.");
            }
        } else {
            console.error("Error promoting user:", error);
        }
    } finally {
        await prisma.$disconnect();
    }
}

main();
