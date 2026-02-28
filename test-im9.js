// test-im9.js
async function run() {
    try {
        const payload = {
            instances: [{ prompt: "test" }],
            parameters: {
                sampleCount: 1,
                aspectRatio: "1:1",
                outputOptions: { mimeType: "image/jpeg" },
                editConfig: {
                    editMode: 'product-image',
                    baseImage: { bytesBase64Encoded: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII=" }
                }
            }
        };
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=AIzaSyDg2rT_pmjnN6RkAKyfXI6y6OOgOgEHqUQ`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await res.json();
        console.log("Status:", res.status);
        console.log("Data stringified:", JSON.stringify(data, null, 2));
    } catch (e) {
        console.error(`Err:`, e.message);
    }
}
run();
