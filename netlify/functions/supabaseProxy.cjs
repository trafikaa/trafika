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
    console.log('=== Supabase 프록시 시작 ===');
    console.log('요청 메서드:', event.httpMethod);
    console.log('요청 바디:', event.body);
    
    // Netlify 환경변수 이름으로 수정 - Service Role Key 사용
    const supabaseUrl = process.env.VITE_SUPABASE_DATABASE_URL || process.env.SUPABASE_DATABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    console.log('환경변수 확인:', {
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseServiceKey,
      urlLength: supabaseUrl ? supabaseUrl.length : 0,
      keyLength: supabaseServiceKey ? supabaseServiceKey.length : 0,
      allEnvVars: Object.keys(process.env).filter(key => key.includes('SUPABASE'))
    });

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase 환경변수가 설정되지 않았습니다.');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { action, table, data, query } = JSON.parse(event.body || '{}');

    console.log('요청 정보:', { action, table, data, query });

    let result;

    switch (action) {
      case 'insert':
        result = await supabase
          .from(table)
          .insert(data)
          .select();
        break;

      case 'select':
        if (query && typeof query === 'object') {
          let queryBuilder = supabase.from(table).select('*');
          
          // 각 쿼리 조건 처리
          Object.keys(query).forEach(key => {
            const value = query[key];
            
            if (typeof value === 'string') {
              // LIKE 쿼리 처리 (%로 시작하거나 끝나는 경우)
              if (value.startsWith('%') && value.endsWith('%')) {
                // 양쪽에 %가 있는 경우
                const searchTerm = value.slice(1, -1);
                queryBuilder = queryBuilder.ilike(key, `%${searchTerm}%`);
              } else if (value.startsWith('%')) {
                // 앞에 %가 있는 경우
                const searchTerm = value.slice(1);
                queryBuilder = queryBuilder.ilike(key, `%${searchTerm}`);
              } else if (value.endsWith('%')) {
                // 뒤에 %가 있는 경우
                const searchTerm = value.slice(0, -1);
                queryBuilder = queryBuilder.ilike(key, `${searchTerm}%`);
              } else {
                // 정확한 매칭
                queryBuilder = queryBuilder.eq(key, value);
              }
            } else {
              // 숫자나 다른 타입
              queryBuilder = queryBuilder.eq(key, value);
            }
          });
          
          result = await queryBuilder;
        } else {
          result = await supabase
            .from(table)
            .select('*');
        }
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

    console.log('쿼리 결과:', result);

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