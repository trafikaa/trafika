const { createClient } = require('@supabase/supabase-js');

exports.handler = async function(event, context) {
  // CORS 헤더 설정
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
  };

  // OPTIONS 요청 처리 (preflight)
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    // 서버 사이드에서만 환경변수 접근
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase 환경변수가 설정되지 않았습니다.');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { action, table, data, query } = JSON.parse(event.body || '{}');

    let result;

    switch (action) {
      case 'insert':
        result = await supabase
          .from(table)
          .insert(data)
          .select();
        break;

      case 'select':
        result = await supabase
          .from(table)
          .select(query || '*');
        break;

      case 'update':
        result = await supabase
          .from(table)
          .update(data)
          .eq('id', query.id)
          .select();
        break;

      case 'delete':
        result = await supabase
          .from(table)
          .delete()
          .eq('id', query.id);
        break;

      default:
        throw new Error('지원하지 않는 액션입니다.');
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(result)
    };

  } catch (error) {
    console.error('Supabase 프록시 오류:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
}; 