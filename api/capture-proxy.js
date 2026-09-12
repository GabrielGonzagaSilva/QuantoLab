module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const target = typeof req.query.target === 'string' ? req.query.target : '';
  const viewport = ['desktop', 'tablet', 'mobile'].includes(req.query.viewport) ? req.query.viewport : 'desktop';
  const format = ['png', 'jpeg', 'svg'].includes(req.query.format) ? req.query.format : 'jpeg';

  if (!target || !/^https?:\/\//i.test(target)) {
    res.status(400).json({ error: 'Valid target URL is required' });
    return;
  }

  try {
    const response = await fetch('https://snapframe-lovat.vercel.app/api/capture', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        url: target,
        index: 0,
        viewport,
        format,
        consent: { enabled: true, mode: 'acceptAll', selector: null }
      })
    });

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      res.status(response.status).json({ error: text || `Capture failed with ${response.status}` });
      return;
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    const b64 = buffer.toString('base64');
    res.setHeader('Cache-Control', 'no-store');
    res.status(200).json({
      target,
      viewport,
      format,
      bytes: buffer.length,
      base64: b64
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
  }
};
