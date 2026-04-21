module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!process.env.ANUBIS_PUBLIC_KEY || !process.env.ANUBIS_SECRET_KEY) {
    return res.status(500).json({ error: 'Missing Anubis environment variables' });
  }

  const auth =
    'Basic ' +
    Buffer.from(
      `${process.env.ANUBIS_PUBLIC_KEY}:${process.env.ANUBIS_SECRET_KEY}`
    ).toString('base64');

  try {
    const r = await fetch('https://api.anubispay.com.br/v1/transactions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': auth
      },
      body: JSON.stringify(req.body)
    });

    const text = await r.text();
    let d;

    try {
      d = JSON.parse(text);
    } catch {
      d = { raw: text };
    }

    console.log('Anubis status:', r.status);
    console.log('Anubis response:', d);

    if (!r.ok) {
      return res.status(r.status).json(d);
    }

    return res.status(200).json({
      id: d.id,
      status: d.status,
      pix: {
        qrcode: d.pix?.qrcode || null
      }
    });
  } catch (e) {
    console.error('Create pix error:', e);
    return res.status(500).json({ error: e.message });
  }
};
