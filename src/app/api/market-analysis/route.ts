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

        const systemPrompt = `You are an expert e-commerce market analyst and strategist.
You will receive a product information file from a client.
Your task is to produce a complete, structured market analysis using EXACTLY the 10 sections below.
Be specific, data-driven, and actionable. Write for an e-commerce operator.
Output each section with its number and title as a header (e.g., "1️⃣ PRODUCT SUMMARY").

1️⃣ PRODUCT SUMMARY — Concise overview of what the product is, its category, and primary value proposition.
2️⃣ PERSONA DISCOVERY — Detailed buyer persona profiles: demographics, psychographics, lifestyle, values, online behavior.
3️⃣ PAIN POINTS ANALYSIS — Deep dive into the core frustrations, problems, and unmet needs the product solves.
4️⃣ CUSTOMER PSYCHOLOGY — Emotional drivers, buying triggers, decision-making patterns, fears, and desires.
5️⃣ PRODUCT POSITIONING (No-Brainer) — How to position this product so the purchase decision feels obvious and risk-free.
6️⃣ COMPETITION & DIFFERENTIATION — Who the competitors are, what they offer, and how this product stands apart.
7️⃣ WINNING AD ANGLES (10 Total) — 10 distinct advertising angles with a hook idea for each angle.
8️⃣ PROOF OF DEMAND — Evidence that this market exists: search trends, competitor traction, social signals.
9️⃣ FINAL BLUEPRINT SUMMARY — A consolidated strategic summary tying all sections together into a go-to-market recommendation.
🔟 NEXT STEPS — Actionable next steps based on the analysis. (Added to make it 10 sections as per the 9+1 implicit structure).`;

        const result = streamText({
            model: google('gemini-2.5-pro'),
            system: systemPrompt,
            prompt: `Here is the product information:\n\n${product.rawText}`,
            onFinish: async ({ text }) => {
                // Save the result to the database when complete
                try {
                    await prisma.product.update({
                        where: { id: productId },
                        data: { marketAnalysis: text },
                    });
                } catch (dbError) {
                    console.error("Failed to save market analysis to DB:", dbError);
                }
            },
        });

        return result.toTextStreamResponse();
    } catch (error) {
        console.error('Market analysis processing error:', error);
        return NextResponse.json({ error: 'Internal server error while generating analysis' }, { status: 500 });
    }
}
