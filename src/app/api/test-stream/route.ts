import { streamText } from 'ai';
import { google } from '@ai-sdk/google';

export const maxDuration = 60;

export async function POST() {
    const result = streamText({
        model: google('gemini-2.5-pro'),
        prompt: 'Say "Hello, streaming works!"',
    });
    return result.toTextStreamResponse();
}
