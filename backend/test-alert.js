const http = require('http');

const loginData = JSON.stringify({ email: 'doctor@example.com', password: 'doctor123' });

const loginReq = http.request({
  hostname: 'localhost',
  port: 5000,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(loginData),
  },
}, (res) => {
  let body = '';
  res.on('data', (chunk) => {
    body += chunk;
  });
  res.on('end', () => {
    console.log('LOGIN STATUS', res.statusCode, body);
    try {
      const parsed = JSON.parse(body);
      if (!parsed.token) return;

      const alertData = JSON.stringify({
        message: 'Test medical alert',
        type: 'health',
        severity: 'high',
        conditions: [{ type: 'heartRate', operator: 'gt', value: 50 }],
      });

      const alertReq = http.request({
        hostname: 'localhost',
        port: 5000,
        path: '/api/alerts',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + parsed.token,
          'Content-Length': Buffer.byteLength(alertData),
        },
      }, (res2) => {
        let body2 = '';
        res2.on('data', (chunk) => {
          body2 += chunk;
        });
        res2.on('end', () => {
          console.log('CREATE ALERT STATUS', res2.statusCode, body2);
        });
      });

      alertReq.write(alertData);
      alertReq.end();
    } catch (e) {
      console.error('PARSE ERROR', e);
    }
  });
});

loginReq.write(loginData);
loginReq.end();
