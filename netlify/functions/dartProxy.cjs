const axios = require('axios');

exports.handler = async function(event, context) {
  const { endpoint, ...params } = event.queryStringParameters;
  const DART_API_KEY = process.env.VITE_DART_API_KEY;

  if (!endpoint) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'endpoint 쿼리 파라미터가 필요합니다.' }),
    };
  }

  const url = `https://opendart.fss.or.kr/api/${endpoint}`;
  params.crtfc_key = DART_API_KEY;

  try {
    const response = await axios.get(url, { params });
    return {
      statusCode: 200,
      body: JSON.stringify(response.data),
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
    };
  }
};