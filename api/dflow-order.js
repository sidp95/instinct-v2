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
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  try {
    const url = new URL(req.url);
    const inputMint = url.searchParams.get('inputMint');
    const outputMint = url.searchParams.get('outputMint');
    const amount = url.searchParams.get('amount');
    const slippageBps = url.searchParams.get('slippageBps') || '100';
    const userPublicKey = url.searchParams.get('userPublicKey');

    console.log('[Proxy] Attempting trade:');
    console.log('  Input (USDC):', inputMint);
    console.log('  Output (prediction token):', outputMint);
    console.log('  Amount:', amount);
    console.log('  User:', userPublicKey);

    const queryParams = new URLSearchParams({
      inputMint,
      outputMint,
      amount,
      slippageBps,
      userPublicKey
    });

    const orderUrl = `https://c.quote-api.dflow.net/order?${queryParams.toString()}`;
    console.log('[Proxy] GET order:', orderUrl);

    // API key from environment variable
    const apiKey = process.env.DFLOW_API_KEY;

    const headers = { 'Accept': 'application/json' };
    if (apiKey) {
      headers['x-api-key'] = apiKey;
      console.log('[Proxy] Using API key');
    } else {
      console.log('[Proxy] WARNING: No DFLOW_API_KEY set');
    }

    const response = await fetch(orderUrl, { headers });
    const text = await response.text();

    console.log('[Proxy] Status:', response.status);
    console.log('[Proxy] Response:', text.substring(0, 300));

    if (response.status === 403) {
      return new Response(JSON.stringify({
        error: 'DFlow API requires authentication. Check API key.',
        code: 'api_key_required'
      }), {
        status: 403,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    try {
      const data = JSON.parse(text);
      return new Response(JSON.stringify(data), {
        status: response.status,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    } catch (e) {
      return new Response(text, {
        status: response.status,
        headers: {
          'Content-Type': 'text/plain',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
  } catch (error) {
    console.error('[Proxy] Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
}
