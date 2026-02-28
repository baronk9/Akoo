async function run() {
    const prompt = 'A futuristic city skyline at sunset';
    try {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:predict?key=${process.env.GOOGLE_API_KEY || 'AIzaSyDg2rT_pmjnN6RkAKyfXI6y6OOgOgEHqUQ'}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ instances: [{ prompt }], parameters: { sampleCount: 1 } })
        });
        const data = await res.json();
        if (data.error) console.log(`Error: ${data.error.message}`);
        else console.log(`Success! ${data.predictions?.length} images.`);
    } catch (e) {
        console.error(`Err:`, e.message);
    }
}
run();
