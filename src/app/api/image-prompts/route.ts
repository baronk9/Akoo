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

        const systemPrompt = `You are an expert visual art director and AI image prompt engineer.
You specialize in writing prompts for Google's Nano Banana image generation tool.
You have access to: (1) the product information and (2) the market analysis.

Generate exactly 5 image prompts. Each prompt should:
• Be highly detailed, descriptive, and optimized for Nano Banana
• Specify style, lighting, composition, background, and mood
• Be directly relevant to the product and its target persona

Use the following exact format for each prompt. DO NOT output any other intro/outro text.
Use "---" as a delimiter between prompts so they can be parsed easily.

### Prompt 1: Hero Product Shot
[Insert detailed prompt here]

---

### Prompt 2: Lifestyle / In-Use Shot
[Insert detailed prompt here]

---

### Prompt 3: Close-Up Detail Shot
[Insert detailed prompt here]

---

### Prompt 4: Aspirational / Emotional Shot
[Insert detailed prompt here]

---

### Prompt 5: Social Proof / UGC-style Shot
[Insert detailed prompt here]`;

        const result = streamText({
            model: google('gemini-2.5-pro'),
            system: systemPrompt,
            prompt: `Product Information:\n${product.rawText}\n\nMarket Analysis:\n${product.marketAnalysis}`,
            onFinish: async ({ text }) => {
                try {
                    await prisma.product.update({
                        where: { id: productId },
                        data: { imagePrompts: text },
                    });
                } catch (error) {
                    console.error('Failed to save image prompts:', error);
                }
            },
        });

        return result.toTextStreamResponse();
    } catch (error) {
        console.error('Image prompts generation error:', error);
        return NextResponse.json({ error: 'Internal server error while generating content' }, { status: 500 });
    }
}
