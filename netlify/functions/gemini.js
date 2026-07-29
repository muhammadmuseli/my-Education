exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || 'gemini-3.6-flash';
  if (!apiKey) return { statusCode: 503, body: JSON.stringify({ error: 'لم يتم إعداد GEMINI_API_KEY في Netlify.' }) };
  try {
    const { prompt, parts = [] } = JSON.parse(event.body || '{}');
    if (!prompt) return { statusCode: 400, body: JSON.stringify({ error: 'Prompt مطلوب.' }) };
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }, ...parts] }] })
    });
    const data = await response.json();
    if (!response.ok) return { statusCode: response.status, body: JSON.stringify({ error: data.error?.message || 'فشل طلب Gemini.' }) };
    return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: data.candidates?.[0]?.content?.parts?.[0]?.text || '' }) };
  } catch (error) { return { statusCode: 500, body: JSON.stringify({ error: error.message || 'خطأ في الوظيفة.' }) }; }
};
