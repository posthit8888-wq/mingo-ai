// api/chat.js (Vercel Serverless Function)
// 이 파일은 밍고의 비밀 두뇌 역할을 하며, 사용자의 요청을 구글 제미나이 API로 중계합니다.

export default async function handler(req, res) {
  // 1. POST 요청만 허용
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // 2. 환경 변수에서 마스터 API 키 가져오기
  // Vercel 설정에서 MINGO_MASTER_KEY 환경 변수를 등록해야 합니다.
  const MASTER_KEY = process.env.MINGO_MASTER_KEY;

  if (!MASTER_KEY) {
    return res.status(500).json({ error: 'Master API Key not configured on server.' });
  }

  try {
    const { contents, modelId } = req.body;
    let targetModel = modelId || 'gemini-2.0-flash';

    // 3. 구글 제미나이 API 호출
    let response = await fetch(`https://generativelanguage.googleapis.com/v1/models/${targetModel}:generateContent?key=${MASTER_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents })
    });

    // 4. 할당량 초과(429) 시 1.5-flash로 자동 폴백
    if (response.status === 429 && targetModel !== 'gemini-1.5-flash') {
      console.warn(`Quota exceeded for ${targetModel}. Falling back to gemini-1.5-flash...`);
      targetModel = 'gemini-1.5-flash';
      response = await fetch(`https://generativelanguage.googleapis.com/v1/models/${targetModel}:generateContent?key=${MASTER_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents })
      });
    }

    // 4. 결과 반환
    const data = await response.json();
    if (!response.ok) {
      console.error('Gemini API Error:', data);
      return res.status(response.status).json(data);
    }
    return res.status(200).json(data);
  } catch (error) {
    console.error('API Proxy Error:', error);
    return res.status(500).json({ error: 'Failed to connect to AI engine.', details: '[V6 Server] ' + error.message });
  }
}
