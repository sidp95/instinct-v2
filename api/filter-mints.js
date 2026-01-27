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
    const { addresses } = body;

    if (!addresses || !Array.isArray(addresses)) {
      return new Response(JSON.stringify({ error: 'addresses array required' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    console.log('[Filter Mints] Filtering', addresses.length, 'addresses');

    const apiKey = process.env.DFLOW_API_KEY;
    const headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    };
    if (apiKey) {
      headers['x-api-key'] = apiKey;
    }

    const response = await fetch('https://c.prediction-markets-api.dflow.net/api/v1/filter_outcome_mints', {
      method: 'POST',
      headers,
      body: JSON.stringify({ addresses }),
    });

    const data = await response.json();
    console.log('[Filter Mints] Found', data.outcomeMints?.length || 0, 'prediction market mints');

    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('[Filter Mints] Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
}
