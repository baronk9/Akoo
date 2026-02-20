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

        const user = await prisma.user.findUnique({
            where: { id: session.userId as string },
        });

        if (!user || user.credits < 1) {
            return NextResponse.json({ error: 'Insufficient credits. Please top up.' }, { status: 403 });
        }

        const product = await prisma.product.findUnique({
            where: { id: productId, userId: session.userId as string },
        });

        if (!product) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        if (!product.marketAnalysis) {
            return NextResponse.json({ error: 'Market analysis data missing' }, { status: 400 });
        }

        // Deduct 1 credit
        await prisma.user.update({
            where: { id: session.userId as string },
            data: { credits: { decrement: 1 } },
        });

        const systemPrompt = `You are an expert e-commerce copywriter.

You have access to: (1) the client's product information file and (2) a completed market analysis.

Your task is to write complete, conversion-optimized product page content.

Use the market analysis insights — especially the persona, pain points, psychology, and positioning — to inform every word.

Output the following sections exactly formatted with markdown headers:

# SEO Product Title (under 70 characters)
[content here]

# Meta Description (under 160 characters)
[content here]

# Hero Headline (emotional, benefit-driven)
[content here]

# Product Description (3–5 paragraphs, storytelling + features)
[content here]

# 5–7 Bullet Point Benefits (outcome-focused)
[content here]

# FAQ Section (5 questions and answers)
[content here]

# Call to Action Text
[content here]`;

        const result = streamText({
            model: google('gemini-2.5-pro'),
            system: systemPrompt,
            prompt: `Product Information:\n${product.rawText}\n\nMarket Analysis:\n${product.marketAnalysis}`,
            onFinish: async ({ text }) => {
                try {
                    await prisma.product.update({
                        where: { id: productId },
                        data: { productPageContent: text },
                    });
                } catch (error) {
                    console.error('Failed to save product page content:', error);
                }
            },
        });

        return result.toTextStreamResponse();
    } catch (error) {
        console.error('Product page generation error:', error);
        return NextResponse.json({ error: 'Internal server error while generating content' }, { status: 500 });
    }
}
