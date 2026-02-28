/* eslint-disable @typescript-eslint/no-require-imports */
const http = require('http');

console.log('Sending request to http://localhost:3001/dashboard/');
const req = http.request('http://localhost:3001/dashboard/', { method: 'GET' }, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
    res.setEncoding('utf8');
    res.on('data', (chunk) => {
        console.log(`BODY: ${chunk.substring(0, 100)}...`);
    });
    res.on('end', () => {
        console.log('No more data in response.');
    });
});

req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
});

// Write data to request body
req.end();
