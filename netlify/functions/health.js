exports.handler = async () => {
  const ready = Boolean(process.env.GEMINI_API_KEY);
  const model = process.env.GEMINI_MODEL || 'gemini-3.8-flash';

  return {
    statusCode: ready ? 200 : 503,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      ready,
      model,
      timestamp: new Date().toISOString()
    })
  };
};
