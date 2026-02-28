import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { generateText } from 'ai';
import { google } from '@ai-sdk/google';

export const maxDuration = 60;

export async function POST(req: Request) {
    try {
        const session = await getSession();
        if (!session || !session.userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { productId, promptContent } = await req.json();

        if (!productId || !promptContent) {
            return NextResponse.json({ error: 'Product ID and prompt content are required' }, { status: 400 });
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

        // If no image is provided, simply return the cleaned original prompt
        if (!product.imageBase64) {
            const cleanPrompt = promptContent.replace(/\*\*/g, '').replace(/\n/g, ' ').substring(0, 400);
            return NextResponse.json({ optimizedPrompt: cleanPrompt });
        }

        const systemPrompt = `YOU ARE:
An expert AI Prompt Engineer specializing in Text-to-Image models (Midjourney, DALL-E, Pollinations).

YOUR TASK:
You will receive a base image prompt and an actual image of a product. 
Your goal is to deeply analyze the provided product image and explicitly integrate its visual characteristics (colors, exact textures, specific shapes, materials, distinctive features, and realistic lighting) directly into the provided base prompt.

CRITICAL RULES:
1. Preserve the original intent, scene, and composition of the base prompt.
2. Inject highly specific, descriptive, and accurate visual details of the product found in the image.
3. Keep the entire response as ONE single, continuous, comma-separated paragraph ready to be pasted into an image generator.
4. DO NOT add conversational filler (e.g., "Here is the prompt:" or "Sure!"). Just output the raw, optimized text prompt.
5. Emphasize extreme realism, high-end photography, "premium ecommerce brand style".
6. Keep the final prompt under 400 characters if possible.`;

        const result = await generateText({
            model: google('gemini-2.5-pro'),
            system: systemPrompt,
            messages: [
                {
                    role: 'user',
                    content: [
                        { type: 'text', text: `Base Prompt to Optimize:\n${promptContent}` },
                        { type: 'image' as const, image: product.imageBase64 }
                    ]
                }
            ],
        });

        const optimizedPrompt = result.text.replace(/\*\*/g, '').replace(/\n/g, ' ').substring(0, 400).trim();

        return NextResponse.json({ optimizedPrompt });

    } catch (error) {
        console.error('Image prompt optimization error:', error);
        return NextResponse.json({ error: 'Internal server error while optimizing prompt' }, { status: 500 });
    }
}
