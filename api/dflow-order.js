export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { inputMint, outputMint, amount, slippageBps, userPublicKey } = req.query;

    console.log('[Proxy] Attempting trade:');
    console.log('  Input (USDC):', inputMint);
    console.log('  Output (prediction token):', outputMint);
    console.log('  Amount:', amount);
    console.log('  User:', userPublicKey);

    const queryParams = new URLSearchParams({
      inputMint,
      outputMint,
      amount,
      slippageBps: slippageBps || '100',
      userPublicKey
    });

    // Use new Trade API
    const orderUrl = `https://c.quote-api.dflow.net/order?${queryParams.toString()}`;
    console.log('[Proxy] GET order:', orderUrl);

    // API key from environment variable (set in Vercel dashboard)
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
      return res.status(403).json({
        error: 'DFlow API requires authentication. Check API key.',
        code: 'api_key_required'
      });
    }

    try {
      const data = JSON.parse(text);
      return res.status(response.status).json(data);
    } catch (e) {
      return res.status(response.status).send(text);
    }
  } catch (error) {
    console.error('[Proxy] Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
