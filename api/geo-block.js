export const config = {
  runtime: 'edge',
};

const BLOCKED_COUNTRIES = [
  'AF', // Afghanistan
  'DZ', // Algeria
  'AO', // Angola
  'AU', // Australia
  'BY', // Belarus
  'BE', // Belgium
  'BO', // Bolivia
  'BG', // Bulgaria
  'BF', // Burkina Faso
  'CM', // Cameroon
  'CA', // Canada
  'CF', // Central African Republic
  'CI', // Côte d'Ivoire
  'CU', // Cuba
  'CD', // Democratic Republic of the Congo
  'ET', // Ethiopia
  'FR', // France
  'HT', // Haiti
  'IR', // Iran
  'IQ', // Iraq
  'IT', // Italy
  'KE', // Kenya
  'LA', // Laos
  'LB', // Lebanon
  'LY', // Libya
  'ML', // Mali
  'MC', // Monaco
  'MZ', // Mozambique
  'MM', // Myanmar (Burma)
  'NA', // Namibia
  'NI', // Nicaragua
  'NE', // Niger
  'KP', // North Korea
  'CN', // People's Republic of China
  'PL', // Poland
  'RU', // Russia
  'SG', // Singapore
  'SO', // Somalia
  'SS', // South Sudan
  'SD', // Sudan
  'CH', // Switzerland
  'SY', // Syria
  'TW', // Taiwan
  'TH', // Thailand
  'UA', // Ukraine
  'AE', // United Arab Emirates
  'GB', // United Kingdom
  'VE', // Venezuela
  'YE', // Yemen
  'ZW', // Zimbabwe
  'US', // United States
];

export default async function handler(request) {
  const country = request.headers.get('x-vercel-ip-country');

  // Block restricted jurisdictions
  if (country && BLOCKED_COUNTRIES.includes(country)) {
    return new Response(
      `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Region Restricted</title>
  <style>
    body {
      font-family: system-ui, -apple-system, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      background: #0a0a0a;
      color: #fff;
    }
    .container {
      text-align: center;
      padding: 2rem;
    }
    h1 {
      font-size: 1.5rem;
      margin-bottom: 1rem;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Instinkt is not available in your region</h1>
  </div>
</body>
</html>`,
      {
        status: 451,
        headers: {
          'Content-Type': 'text/html',
        },
      }
    );
  }

  // For allowed countries, fetch the original content with bypass header
  const url = new URL(request.url);
  const originalPath = url.searchParams.get('path') || '/';
  const originUrl = new URL(originalPath, url.origin);

  // Add header to bypass the rewrite on the internal fetch
  const response = await fetch(originUrl, {
    headers: {
      'x-geo-bypass': 'true',
    },
  });

  return response;
}
