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
const apiKey = config.GEMINI_API_KEY || process.env.GEMINI_API_KEY;
const primaryModel = config.GEMINI_MODEL || 'gemini-3.8-flash';
const fallbackModels = [
  primaryModel,
  'gemini-3.8-flash-lite',
  'gemini-3.8-pro',
  'gemini-2.0-flash'
];

function send(res, status, body) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(JSON.stringify(body));
}

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function generateWithFallback(payload) {
  let lastError = 'Gemini API request failed';
  let lastStatus = 500;

  for (const modelName of fallbackModels) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }
      );

      const data = await response.json();
      if (response.ok) {
        return { ok: true, status: 200, text: data.candidates?.[0]?.content?.parts?.[0]?.text || '' };
      }

      lastStatus = response.status;
      lastError = data.error?.message || lastError;

      // If high demand (503) or rate limit (429), wait 1.5s and retry
      if (response.status === 503 || response.status === 429 || /high demand|overloaded/i.test(lastError)) {
        await sleep(1500 * attempt);
        continue;
      }
      // If model not available/found, break inner loop and try next fallback model
      break;
    }
  }

  return { ok: false, status: lastStatus, error: lastError };
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') return send(res, 204, {});
  if (req.url === '/api/health') {
    return send(res, apiKey ? 200 : 503, {
      ready: Boolean(apiKey),
      model: primaryModel,
      timestamp: new Date().toISOString()
    });
  }
  if (req.method !== 'POST' || req.url !== '/api/gemini') return send(res, 404, { error: 'Not found' });
  if (!apiKey) return send(res, 503, { error: 'GEMINI_API_KEY is missing in the .env file' });

  let raw = '';
  req.on('data', chunk => {
    raw += chunk;
    if (raw.length > 55 * 1024 * 1024) req.destroy();
  });

  req.on('end', async () => {
    try {
      const { prompt, parts = [] } = JSON.parse(raw || '{}');
      if (!prompt) return send(res, 400, { error: 'Prompt is required' });

      const result = await generateWithFallback({
        contents: [{ parts: [{ text: prompt }, ...parts] }]
      });

      if (!result.ok) return send(res, result.status, { error: result.error });
      send(res, 200, { text: result.text });
    } catch (error) {
      send(res, 500, { error: error.message || 'Internal server error' });
    }
  });
});

const port = Number(process.env.PORT || 3000);
server.listen(port, '127.0.0.1', () => console.log(`Ofoq AI server running: http://127.0.0.1:${port}`));