const run = async () => {
    try {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GOOGLE_API_KEY || 'AIzaSyDg2rT_pmjnN6RkAKyfXI6y6OOgOgEHqUQ'}`);
        const data = await res.json();

        if (data.models) {
            const imageModels = data.models.filter(m => m.name.includes('imagen') || m.name.includes('vision') || m.supportedGenerationMethods.includes('generateImage'));
            console.log("Image related models found:");
            imageModels.forEach(m => {
                console.log(`- ${m.name} (${m.displayName})`);
                console.log(`  Methods: ${m.supportedGenerationMethods.join(', ')}`);
            });
        } else {
            console.log("Response:", data);
        }
    } catch (e) {
        console.error("Err:", e);
    }
}
run();
