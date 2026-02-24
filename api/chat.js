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

    // 3. 구글 제미나이 API 호출 (가장 호환성 높은 v1beta 버전 사용)
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelId || 'gemini-1.5-flash'}:generateContent?key=${MASTER_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents })
    });

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
