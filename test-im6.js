// test-im6.js
async function run() {
    const prompt = 'A futuristic city skyline at sunset';
    // 1x1 pixel white png
    const base64data = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII=";

    try {
        const payload = {
            instances: [{ prompt }],
            parameters: {
                sampleCount: 1,
                aspectRatio: "16:9", // Try passing aspect ratio
                editConfig: {
                    editMode: 'product-image',
                    baseImage: { bytesBase64Encoded: base64data }
                }
            }
        };
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=AIzaSyDg2rT_pmjnN6RkAKyfXI6y6OOgOgEHqUQ`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        let data;
        try {
            data = await res.json();
        } catch {
            console.log("Response text:", await res.text());
            return;
        }
        console.log("Status:", res.status);
        console.log("Data:", JSON.stringify(data, null, 2));
    } catch (e) {
        console.error(`Err:`, e.message);
    }
}
run();
