module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' });
  }
  const { id } = req.query;
  if (!id) return res.status(400).json({ error: 'ID obrigatório' });
  const PUBLIC_KEY = process.env.ANUBIS_PUBLIC_KEY;
  const SECRET_KEY = process.env.ANUBIS_SECRET_KEY;
  const auth = 'Basic ' + Buffer.from(PUBLIC_KEY + ':' + SECRET_KEY).toString('base64');
  try {
    const response = await fetch(`https://api.anubispay.com.br/v1/transactions/${id}`, {
      method: 'GET',
      headers: { 'Accept': 'application/json', 'Authorization': auth }
    });
    const data = await response.json();
    if (!response.ok) return res.status(response.status).json(data);
    return res.status(200).json({ id: data.id, status: data.status });
  } catch (err) {
    return res.status(500).json({ error: 'Erro interno: ' + err.message });
  }
}
