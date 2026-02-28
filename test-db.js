/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
    console.log("Connecting to database...");
    const timeout = setTimeout(() => {
        console.log("Connection timed out after 5 seconds - likely paused DB or network issue.");
        process.exit(1);
    }, 5000);

    try {
        const users = await prisma.user.findMany({ take: 1 });
        clearTimeout(timeout);
        console.log("Successfully connected. Users:", users.length);
    } catch (err) {
        clearTimeout(timeout);
        console.error("Connection error:", err.message);
    } finally {
        await prisma.$disconnect();
    }
}

test();
