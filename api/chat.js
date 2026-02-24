// api/chat.js (2026년형 2.5 버전으로 업데이트!)
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
  const MASTER_KEY = process.env.MINGO_MASTER_KEY;
  if (!MASTER_KEY) return res.status(500).json({ error: 'Master API Key not configured.' });
  try {
    const { contents, modelId } = req.body;
    // 모델 이름을 'gemini-2.5-flash'로 최신화했습니다!
    const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/${modelId || 'gemini-2.5-flash'}:generateContent?key=${MASTER_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents })
    });
    const data = await response.json();
    if (!response.ok) return res.status(response.status).json(data);
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to connect.', details: '[V6.1 Final] ' + error.message });
  }
}

