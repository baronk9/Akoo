async function run() {
    const prompt = 'A futuristic city skyline at sunset';
    const base64data = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII=";

    try {
        const payload = {
            instances: [{ prompt }],
            parameters: {
                sampleCount: 1,
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
        const data = await res.json();
        console.log("Keys:", Object.keys(data));
        if (data.error) console.error("Error:", data.error);
        if (data.predictions) console.log("Success, got predictions");
    } catch (e) {
        console.error(`Err:`, e.message);
    }
}
run();
