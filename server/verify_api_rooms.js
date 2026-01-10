const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/rooms',
  method: 'GET',
};

const req = http.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('STATUS:', res.statusCode);
    if (res.statusCode === 200) {
        console.log('DATA:', data);
    } else {
        console.log('API Failed:', data);
    }
  });
});

req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
});

req.end();
