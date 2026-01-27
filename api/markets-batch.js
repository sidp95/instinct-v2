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
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }

  try {
    const body = await req.json();
    const { mints } = body;

    if (!mints || !Array.isArray(mints)) {
      return new Response(JSON.stringify({ error: 'mints array required' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    console.log('[Markets Batch] Fetching', mints.length, 'markets');

    const apiKey = process.env.DFLOW_API_KEY;
    const headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    };
    if (apiKey) {
      headers['x-api-key'] = apiKey;
    }

    const response = await fetch('https://c.prediction-markets-api.dflow.net/api/v1/markets/batch', {
      method: 'POST',
      headers,
      body: JSON.stringify({ mints }),
    });

    const data = await response.json();
    console.log('[Markets Batch] Got', data.markets?.length || 0, 'markets');

    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('[Markets Batch] Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
}
