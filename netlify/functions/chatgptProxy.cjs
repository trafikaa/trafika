const { OpenAI } = require('openai');

exports.handler = async (event, context) => {
  // CORS 헤더 설정
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  // OPTIONS 요청 처리 (CORS preflight)
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  // POST 요청만 허용
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { messages, options = {} } = JSON.parse(event.body);

    if (!messages || !Array.isArray(messages)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Messages array is required' }),
      };
    }

    // OpenAI 클라이언트 초기화
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // 기본 옵션 설정
    const defaultOptions = {
      model: 'gpt-3.5-turbo',
      max_tokens: 1000,
      temperature: 0.7,
      ...options,
    };

    // ChatGPT API 호출
    const completion = await openai.chat.completions.create({
      model: defaultOptions.model,
      messages: messages,
      max_tokens: defaultOptions.max_tokens,
      temperature: defaultOptions.temperature,
    });

    const response = completion.choices[0]?.message?.content || '응답을 생성할 수 없습니다.';

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ response }),
    };

  } catch (error) {
    console.error('ChatGPT API 오류:', error);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'ChatGPT API 호출 중 오류가 발생했습니다.',
        details: error.message 
      }),
    };
  }
}; 