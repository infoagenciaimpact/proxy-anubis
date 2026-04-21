module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  const { id } = req.query;
  if (!id) return res.status(400).json({ error: 'ID required' });
  const auth = 'Basic ' + Buffer.from(process.env.ANUBIS_PUBLIC_KEY + ':' + process.env.ANUBIS_SECRET_KEY).toString('base64');
  try {
    const r = await fetch(`https://api.anubispay.com.br/v1/transactions/${id}`, {
      method: 'GET',
      headers: { 'Accept': 'application/json', 'Authorization': auth }
    });
    const d = await r.json();
    return res.status(r.status).json(r.ok ? { id: d.id, status: d.status } : d);
  } catch(e) {
    return res.status(500).json({ error: e.message });
  }
};
