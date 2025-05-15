export default async function handler(req, res) {
  // CORS header ekle
  res.setHeader('Access-Control-Allow-Origin', '*'); // Her yerden istek kabul eder
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    // Preflight isteklere 200 dön
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).send("Sadece POST istekleri destekleniyor.");
  }

  // ... geriye kalan kodun aynen devam eder ...
}
