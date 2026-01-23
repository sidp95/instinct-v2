export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  try {
    // Get query params from URL
    const url = new URL(req.url);
    const queryString = url.search;

    const apiUrl = `https://c.prediction-markets-api.dflow.net/api/v1/events${queryString}`;
    console.log('[Markets Proxy] Fetching:', apiUrl);

    // API key from environment variable
    const apiKey = process.env.DFLOW_API_KEY;

    const headers = { 'Accept': 'application/json' };
    if (apiKey) {
      headers['x-api-key'] = apiKey;
    }

    const response = await fetch(apiUrl, { headers });
    const data = await response.json();

    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('[Markets Proxy] Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
}
