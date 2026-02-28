/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
async function run() {
    // Read the test image (e.g. from the codebase or an arbitrary image)
    // I need a real image. I'll download a quick sample.
    const imageRes = await fetch('https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Apple-logo.png/120px-Apple-logo.png');
    const buffer = await imageRes.arrayBuffer();
    const base64Image = Buffer.from(buffer).toString('base64');

    const prompt = 'A futuristic city skyline at sunset';

    const payload = {
        instances: [{ prompt }],
        parameters: {
            sampleCount: 1,
            editConfig: {
                editMode: 'product-image',
                baseImage: { bytesBase64Encoded: base64Image }
            }
        }
    };

    console.log(`Testing product-image edit mode...`);
    try {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${process.env.GOOGLE_API_KEY || 'AIzaSyDg2rT_pmjnN6RkAKyfXI6y6OOgOgEHqUQ'}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (data.error) console.log(`Error: ${data.error.message}`);
        else {
            console.log(`Success! Saving image...`);
            const outBase64 = data.predictions[0].bytesBase64Encoded;
            fs.writeFileSync('out.png', Buffer.from(outBase64, 'base64'));
            console.log("Saved out.png");
        }
    } catch (e) {
        console.error(`Err:`, e.message);
    }
}
run();
