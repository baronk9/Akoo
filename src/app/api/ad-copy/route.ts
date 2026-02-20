import { streamText } from 'ai';
import { google } from '@ai-sdk/google';
import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export const maxDuration = 60;

export async function POST(req: Request) {
    try {
        const session = await getSession();
        if (!session || !session.userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { productId } = await req.json();

        if (!productId) {
            return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
        }

        const product = await prisma.product.findUnique({
            where: { id: productId, userId: session.userId as string },
        });

        if (!product) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        if (!product.marketAnalysis || !product.productPageContent) {
            return NextResponse.json({ error: 'Required context missing (Market Analysis or Product Page Content)' }, { status: 400 });
        }

        const systemPrompt = `You are a world-class direct-response copywriter specializing in Facebook and Instagram advertising.
You have access to: (1) the product information, (2) the full market analysis, and (3) the product page content.

Use the winning ad angles, pain points, customer psychology, and positioning from the market analysis to generate high-converting ads.

Generate the following exactly 7 ad formats:
• 3x Short-Form Ads (Primary text under 125 characters, punchy headline)
• 2x Long-Form Story Ads (Primary text 300–500 characters, narrative-driven)
• 1x Pain-Point Ad (Leads with the core problem, then presents the product as the solution)
• 1x Social Proof Ad (Testimonial-style, even if fictional/templated)

Format each ad exactly like this, separated by "---":

### [Ad Type Name]
**Primary Text:** [text here]
**Headline:** [headline here]
**Description:** [description here]
**CTA:** [Shop Now / Learn More / etc.]
`;

        const result = streamText({
            model: google('gemini-2.5-pro'),
            system: systemPrompt,
            prompt: `Product Information:\n${product.rawText}\n\nMarket Analysis:\n${product.marketAnalysis}\n\nProduct Page Content:\n${product.productPageContent}`,
            onFinish: async ({ text }) => {
                try {
                    await prisma.product.update({
                        where: { id: productId },
                        data: { adCopy: text },
                    });
                } catch (error) {
                    console.error('Failed to save ad copy:', error);
                }
            },
        });

        return result.toTextStreamResponse();
    } catch (error) {
        console.error('Ad copy generation error:', error);
        return NextResponse.json({ error: 'Internal server error while generating content' }, { status: 500 });
    }
}
