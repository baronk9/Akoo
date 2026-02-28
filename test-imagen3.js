async function run() {
    const prompt = 'A futuristic city skyline at sunset';
    const base64Image = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

    const payloads = [
        { name: 'v4 editConfig PRODUCT_IMAGE uppercase', model: 'imagen-4.0-generate-001', payload: { instances: [{ prompt }], parameters: { sampleCount: 1, editConfig: { editMode: 'PRODUCT_IMAGE', baseImage: { bytesBase64Encoded: base64Image } } } } },
        { name: 'v4 editConfig product-image lowercase', model: 'imagen-4.0-generate-001', payload: { instances: [{ prompt }], parameters: { sampleCount: 1, editConfig: { editMode: 'product-image', baseImage: { bytesBase64Encoded: base64Image } } } } },
    ];

    for (const p of payloads) {
        console.log(`Testing ${p.name}...`);
        try {
            const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${p.model}:predict?key=${process.env.GOOGLE_API_KEY || 'AIzaSyDg2rT_pmjnN6RkAKyfXI6y6OOgOgEHqUQ'}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(p.payload)
            });
            const data = await res.json();
            if (data.error) console.log(`Error: ${data.error.message}`);
            else console.log(`Success! ${data.predictions.length} images.`);
        } catch (e) {
            console.error(`Err:`, e.message);
        }
    }
}
run();
