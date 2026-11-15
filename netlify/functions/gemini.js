const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const headers = {
  'Content-Type': 'application/json; charset=utf-8',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
};

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  const apiKey = process.env.GEMINI_API_KEY;
  const primaryModel = process.env.GEMINI_MODEL || 'gemini-3.8-flash';
  const fallbackModels = [
    primaryModel,
    'gemini-3.8-flash-lite',
    'gemini-3.8-pro',
    'gemini-2.0-flash'
  ];

  if (!apiKey) {
    return {
      statusCode: 503,
      headers,
      body: JSON.stringify({ error: 'GEMINI_API_KEY is not configured in Netlify environment variables.' })
    };
  }

  try {
    const { prompt, parts = [] } = JSON.parse(event.body || '{}');
    if (!prompt) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Prompt is required.' }) };
    }

    const payload = { contents: [{ parts: [{ text: prompt }, ...parts] }] };
    let lastError = 'Gemini API request failed.';
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
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ text: data.candidates?.[0]?.content?.parts?.[0]?.text || '' })
          };
        }

        lastStatus = response.status;
        lastError = data.error?.message || lastError;

        if (response.status === 503 || response.status === 429 || /high demand|overloaded/i.test(lastError)) {
          await sleep(1500 * attempt);
          continue;
        }
        break;
      }
    }

    return { statusCode: lastStatus, headers, body: JSON.stringify({ error: lastError }) };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message || 'Internal serverless function error.' })
    };
  }
};
