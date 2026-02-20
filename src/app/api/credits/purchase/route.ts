import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { getSession } from '@/lib/auth';

export async function POST(req: Request) {
    try {
        const session = await getSession();

        if (!session || !session.userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { credits } = await req.json();

        if (!credits || credits <= 0) {
            return NextResponse.json({ error: 'Invalid credit amount' }, { status: 400 });
        }

        // Assuming a simple pricing model: $1 per credit
        const amount = credits * 100; // in cents

        const checkoutSession = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: `${credits} AI Generation Credits`,
                            description: 'Credits for E-Commerce AI Launch Platform',
                        },
                        unit_amount: amount,
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard?success=true`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard?canceled=true`,
            client_reference_id: session.userId as string,
            metadata: {
                userId: session.userId as string,
                credits: credits.toString(),
            },
        });

        return NextResponse.json({ url: checkoutSession.url });
    } catch (error) {
        console.error('Stripe checkout error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
