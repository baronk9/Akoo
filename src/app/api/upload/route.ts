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
        const files = formData.getAll('files') as File[];

        if (!files || files.length === 0) {
            return NextResponse.json({ error: 'No files uploaded' }, { status: 400 });
        }

        let combinedText = '';
        let imageBase64: string | null = null;
        let mainFileName = files[0].name;

        for (const file of files) {
            if (file.size > 50 * 1024 * 1024) {
                return NextResponse.json({ error: `File ${file.name} is too large. Maximum size is 50MB.` }, { status: 400 });
            }

            const isPdf = file.name.toLowerCase().endsWith('.pdf');
            const isTxt = file.name.toLowerCase().endsWith('.txt');
            const isImage = file.type.startsWith('image/');

            if (!isPdf && !isTxt && !isImage) {
                return NextResponse.json({ error: `File ${file.name} has an invalid type. Only .txt, .pdf, and images are accepted.` }, { status: 400 });
            }

            if (isImage) {
                const arrayBuffer = await file.arrayBuffer();
                const base64 = Buffer.from(arrayBuffer).toString('base64');
                imageBase64 = `data:${file.type};base64,${base64}`;
                // Set main filename to image if no text file provided yet, else keep the text file's name
                if (!combinedText) mainFileName = file.name;
            } else if (isPdf) {
                mainFileName = file.name;
                try {
                    const arrayBuffer = await file.arrayBuffer();
                    const buffer = Buffer.from(arrayBuffer);

                    const text = await new Promise<string>((resolve, reject) => {
                        // eslint-disable-next-line @typescript-eslint/no-require-imports
                        const PDFParser = require("pdf2json");
                        const pdfParser = new PDFParser(null, 1);

                        pdfParser.on("pdfParser_dataError", (errData: { parserError: Error }) => reject(errData.parserError));
                        // eslint-disable-next-line @typescript-eslint/no-unused-vars
                        pdfParser.on("pdfParser_dataReady", (pdfData: unknown) => {
                            resolve(pdfParser.getRawTextContent().replace(/\r\n/g, ' '));
                        });

                        pdfParser.parseBuffer(buffer);
                    });
                    combinedText += `\n${text}`;
                } catch (pdfError) {
                    console.error('PDF parsing error:', pdfError);
                    return NextResponse.json({ error: `Failed to extract text from PDF file ${file.name}.` }, { status: 400 });
                }
            } else if (isTxt) {
                mainFileName = file.name;
                const text = await file.text();
                combinedText += `\n${text}`;
            }
        }

        if (!combinedText.trim() && !imageBase64) {
            return NextResponse.json({ error: 'Files appear to be empty or unscannable.' }, { status: 400 });
        }

        // Use explicit projectName if provided, otherwise fallback to first line or filename
        const explicitName = formData.get('projectName') as string | null;
        let finalName = '';

        if (explicitName && explicitName.trim()) {
            finalName = explicitName.trim();
        } else {
            const firstLine = combinedText.trim().split('\n')[0].trim();
            finalName = firstLine.length > 0 && firstLine.length < 50 ? firstLine : mainFileName.replace(/\.(txt|pdf|png|jpg|jpeg|webp)$/i, '');
        }

        const product = await prisma.product.create({
            data: {
                userId: session.userId as string,
                name: finalName,
                rawText: combinedText.trim(),
                imageBase64: imageBase64,
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
