/**
 * Test if DFlow /order endpoint works for redemption
 * (swapping winning outcome tokens back to USDC)
 * Run with: node scripts/test-redeem-order.js
 */

const DFLOW_API_KEY = process.env.DFLOW_API_KEY || '';
const QUOTE_API = 'https://c.quote-api.dflow.net';
const USDC_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';

// Winning NO token from PRES-2024-KH (Kamala Harris lost, so NO won)
const WINNING_NO_MINT = '3CrbJmeG912tNphnKSZwEyZ1cyQV4dnFQ1NwxpFKvsrU';

// Test user (use a real funded wallet to test actual redemption)
const TEST_USER = 'DummyPubkey11111111111111111111111111111111';

async function testEndpoint(name, url) {
  console.log('\n========================================');
  console.log(`Testing: ${name}`);
  console.log(`URL: ${url}`);
  console.log('========================================');

  const headers = { 'Accept': 'application/json' };
  if (DFLOW_API_KEY) {
    headers['x-api-key'] = DFLOW_API_KEY;
  }

  try {
    const response = await fetch(url, { headers });
    const text = await response.text();

    console.log('Status:', response.status);

    if (text) {
      try {
        const data = JSON.parse(text);
        console.log('Response:', JSON.stringify(data, null, 2).substring(0, 2000));
        return data;
      } catch {
        console.log('Non-JSON:', text.substring(0, 500));
      }
    } else {
      console.log('Empty response');
    }
  } catch (error) {
    console.log('Error:', error.message);
  }
  return null;
}

async function main() {
  console.log('DFlow Order Endpoint Test (Redemption)');
  console.log('API Key:', DFLOW_API_KEY ? 'SET' : 'NOT SET');
  console.log('');
  console.log('Testing if we can swap winning outcome tokens back to USDC');
  console.log('This is effectively "redemption" or "claiming winnings"');

  // Test 1: Normal buy order (USDC -> outcome token) - should work
  console.log('\n\n=== TEST 1: Normal Buy Order (USDC -> outcome) ===');
  const buyParams = new URLSearchParams({
    inputMint: USDC_MINT,
    outputMint: WINNING_NO_MINT,
    amount: '100000', // 0.1 USDC (6 decimals)
    slippageBps: '100',
    userPublicKey: TEST_USER,
  });
  await testEndpoint('Buy order', `${QUOTE_API}/order?${buyParams}`);

  // Test 2: Reverse order (outcome token -> USDC) - this is redemption
  console.log('\n\n=== TEST 2: Redemption Order (outcome -> USDC) ===');
  const redeemParams = new URLSearchParams({
    inputMint: WINNING_NO_MINT,
    outputMint: USDC_MINT,
    amount: '1000000', // 1 token (6 decimals)
    slippageBps: '100',
    userPublicKey: TEST_USER,
  });
  await testEndpoint('Redeem order', `${QUOTE_API}/order?${redeemParams}`);

  // Test 3: Check if there's a specific redeem endpoint
  console.log('\n\n=== TEST 3: Specific Redeem Endpoint ===');
  await testEndpoint('Redeem endpoint', `${QUOTE_API}/redeem?${redeemParams}`);

  // Test 4: Try with POST method
  console.log('\n\n=== TEST 4: POST to order endpoint ===');
  try {
    const headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    };
    if (DFLOW_API_KEY) {
      headers['x-api-key'] = DFLOW_API_KEY;
    }

    const response = await fetch(`${QUOTE_API}/order`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        inputMint: WINNING_NO_MINT,
        outputMint: USDC_MINT,
        amount: '1000000',
        slippageBps: '100',
        userPublicKey: TEST_USER,
      }),
    });

    const text = await response.text();
    console.log('POST /order status:', response.status);
    if (text) {
      try {
        console.log('Response:', JSON.stringify(JSON.parse(text), null, 2).substring(0, 1000));
      } catch {
        console.log('Response:', text.substring(0, 500));
      }
    }
  } catch (error) {
    console.log('POST error:', error.message);
  }

  // Summary
  console.log('\n\n========================================');
  console.log('SUMMARY');
  console.log('========================================');
  console.log('If the redemption order works:');
  console.log('- We can reuse the existing placeBet flow');
  console.log('- Just swap inputMint and outputMint');
  console.log('- Add a "Claim" button that triggers redemption');
  console.log('');
  console.log('If it does not work:');
  console.log('- May need to interact directly with Solana program');
  console.log('- Check for redeem instruction in program IDL');
}

main().catch(console.error);
