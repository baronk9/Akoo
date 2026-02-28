import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import prisma from '@/lib/prisma';
import Stripe from 'stripe';

export async function POST(req: Request) {
    const body = await req.text();
    const signature = req.headers.get('stripe-signature') as string;

    let event;

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        );
    } catch (err: unknown) {
        if (err instanceof Error) {
            return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
        }
        return new NextResponse(`Webhook Error`, { status: 400 });
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        const creditsStr = session.metadata?.credits;

        if (userId && creditsStr) {
            const credits = parseInt(creditsStr, 10);
            try {
                await prisma.user.update({
                    where: { id: userId },
                    data: {
                        credits: {
                            increment: credits,
                        },
                    },
                });
                console.log(`Successfully added ${credits} credits to user ${userId}`);
            } catch (error) {
                console.error('Error updating credits:', error);
            }
        }
    }

    return new NextResponse(null, { status: 200 });
}
