async function run() {
    try {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=AIzaSyDg2rT_pmjnN6RkAKyfXI6y6OOgOgEHqUQ`);
        const data = await res.json();
        const models = data.models.map(m => m.name).filter(name => name.includes('imagen'));
        console.log(models);
    } catch (e) {
        console.error(e.message);
    }
}
run();
