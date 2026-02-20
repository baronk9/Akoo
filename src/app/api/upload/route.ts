import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
    try {
        const session = await getSession();
        if (!session || !session.userId) {
            return NextResponse.json({ error: 'Unauthorized. Please log in first.' }, { status: 401 });
        }

        const formData = await req.formData();
        const file = formData.get('file') as File | null;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        const isPdf = file.name.toLowerCase().endsWith('.pdf');

        if (!file.name.toLowerCase().endsWith('.txt') && !isPdf) {
            return NextResponse.json({ error: 'Only .txt and .pdf files are accepted' }, { status: 400 });
        }

        if (file.size > 5 * 1024 * 1024) {
            return NextResponse.json({ error: 'File is too large. Maximum size is 5MB.' }, { status: 400 });
        }

        let text = '';

        if (isPdf) {
            try {
                const arrayBuffer = await file.arrayBuffer();
                const buffer = Buffer.from(arrayBuffer);

                text = await new Promise((resolve, reject) => {
                    const PDFParser = require("pdf2json");
                    const pdfParser = new PDFParser(null, 1);

                    pdfParser.on("pdfParser_dataError", (errData: any) => reject(errData.parserError));
                    pdfParser.on("pdfParser_dataReady", (pdfData: any) => {
                        resolve(pdfParser.getRawTextContent().replace(/\\r\\n/g, ' '));
                    });

                    pdfParser.parseBuffer(buffer);
                });
            } catch (pdfError) {
                console.error('PDF parsing error:', pdfError);
                return NextResponse.json({ error: 'Failed to extract text from PDF file.' }, { status: 400 });
            }
        } else {
            text = await file.text();
        }

        if (!text.trim()) {
            return NextResponse.json({ error: 'Your file appears to be empty or unscannable. Please add product details.' }, { status: 400 });
        }

        // Use explicit projectName if provided, otherwise fallback to first line or filename
        const explicitName = formData.get('projectName') as string | null;
        let finalName = '';

        if (explicitName && explicitName.trim()) {
            finalName = explicitName.trim();
        } else {
            const firstLine = text.trim().split('\n')[0].trim();
            finalName = firstLine.length > 0 && firstLine.length < 50 ? firstLine : file.name.replace(/\.(txt|pdf)$/i, '');
        }

        const product = await prisma.product.create({
            data: {
                userId: session.userId as string,
                name: finalName,
                rawText: text,
            },
        });

        return NextResponse.json({
            message: 'File processed successfully',
            product: {
                id: product.id,
                name: product.name,
                rawText: product.rawText
            }
        });
    } catch (error) {
        console.error('Upload processing error:', error);
        return NextResponse.json({ error: 'Internal server error while processing file' }, { status: 500 });
    }
}
