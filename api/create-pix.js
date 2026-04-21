module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const auth = 'Basic ' + Buffer.from(process.env.ANUBIS_PUBLIC_KEY + ':' + process.env.ANUBIS_SECRET_KEY).toString('base64');
  try {
    const r = await fetch('https://api.anubispay.com.br/v1/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Authorization': auth },
      body: JSON.stringify(req.body)
    });
    const d = await r.json();
    return res.status(r.status).json(r.ok ? { id: d.id, status: d.status, pixCode: d.pix?.qrcode || null } : d);
  } catch(e) {
    return res.status(500).json({ error: e.message });
  }
};
