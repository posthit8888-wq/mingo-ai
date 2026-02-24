// api/chat.js (Vercel Serverless Function)
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const MASTER_KEY = process.env.MINGO_MASTER_KEY;
  if (!MASTER_KEY) {
    return res.status(500).json({ error: 'Master API Key not configured on server.' });
  }

  try {
    const { contents, modelId } = req.body;
    let targetModel = modelId || 'gemini-2.0-flash';
    let isFallback = false;
    
    // 3. 구글 제미나이 API 호출 (v1beta 사용)
    let response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent?key=${MASTER_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents })
    });

    // 4. 할당량 초과(429) 시 1.5-flash로 자동 폴백
    if (response.status === 429 && targetModel !== 'gemini-1.5-flash') {
      targetModel = 'gemini-1.5-flash';
      isFallback = true;
      response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent?key=${MASTER_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents })
      });
    }

    const data = await response.json();
    if (!response.ok) return res.status(response.status).json(data);

    data.mingo_model = targetModel;
    data.mingo_fallback = isFallback;
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to connect to AI engine.', details: error.message });
  }
}
