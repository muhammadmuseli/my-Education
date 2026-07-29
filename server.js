const http = require('http');
const fs = require('fs');
const path = require('path');

function loadEnv() {
  const envPath = path.join(__dirname, '.env');
  if (!fs.existsSync(envPath)) return {};
  return fs.readFileSync(envPath, 'utf8').split(/\r?\n/).reduce((env, line) => {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (match && !match[1].startsWith('#')) env[match[1]] = match[2].replace(/^['"]|['"]$/g, '');
    return env;
  }, {});
}
const config = loadEnv();
const apiKey = config.GEMINI_API_KEY;
const model = config.GEMINI_MODEL || 'gemini-3.6-flash';

function send(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Access-Control-Allow-Origin': 'http://127.0.0.1:5500', 'Access-Control-Allow-Methods': 'POST, GET, OPTIONS' });
  res.end(JSON.stringify(body));
}
const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') return send(res, 204, {});
  if (req.url === '/api/health') return send(res, apiKey ? 200 : 503, { ready: Boolean(apiKey), model });
  if (req.method !== 'POST' || req.url !== '/api/gemini') return send(res, 404, { error: 'Not found' });
  if (!apiKey) return send(res, 503, { error: 'GEMINI_API_KEY غير موجود في ملف .env' });
  let raw = ''; req.on('data', chunk => { raw += chunk; if (raw.length > 55 * 1024 * 1024) req.destroy(); });
  req.on('end', async () => {
    try {
      const { prompt, parts = [] } = JSON.parse(raw || '{}');
      if (!prompt) return send(res, 400, { error: 'Prompt مطلوب' });
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contents: [{ parts: [{ text: prompt }, ...parts] }] }) });
      const data = await response.json();
      if (!response.ok) return send(res, response.status, { error: data.error?.message || 'فشل طلب Gemini' });
      send(res, 200, { text: data.candidates?.[0]?.content?.parts?.[0]?.text || '' });
    } catch (error) { send(res, 500, { error: error.message || 'خطأ في السيرفر' }); }
  });
});
const port = Number(process.env.PORT || 3000);
server.listen(port, '127.0.0.1', () => console.log(`Ofoq AI server running: http://127.0.0.1:${port}`));
