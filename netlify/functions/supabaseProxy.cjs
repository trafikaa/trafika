const { createClient } = require('@supabase/supabase-js');

// 전역 변수로 Supabase 클라이언트 재사용
let supabaseClient = null;

function getSupabaseClient() {
  if (!supabaseClient) {
    // 환경 변수에서 가져오거나 기본값 사용
    const supabaseUrl = process.env.VITE_SUPABASE_DATABASE_URL || process.env.SUPABASE_DATABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    console.log('환경 변수 확인:', {
      supabaseUrl: supabaseUrl ? '설정됨' : '설정되지 않음',
      hasServiceKey: supabaseServiceKey ? '설정됨' : '설정되지 않음'
    });
    
    if (!supabaseUrl) {
      throw new Error('supabaseUrl is required. Please set VITE_SUPABASE_DATABASE_URL environment variable.');
    }
    
    if (!supabaseServiceKey) {
      throw new Error('supabaseServiceKey is required. Please set SUPABASE_SERVICE_ROLE_KEY environment variable.');
    }
    
    supabaseClient = createClient(supabaseUrl, supabaseServiceKey);
  }
  return supabaseClient;
}

exports.handler = async function(event, context) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    console.log('Supabase 프록시 시작');
    console.log('모든 환경 변수 확인:', {
      VITE_SUPABASE_DATABASE_URL: process.env.VITE_SUPABASE_DATABASE_URL,
      SUPABASE_DATABASE_URL: process.env.SUPABASE_DATABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? '설정됨' : '설정되지 않음',
      NODE_ENV: process.env.NODE_ENV
    });
    
    const supabase = getSupabaseClient();
    const { action, table, data, query } = JSON.parse(event.body || '{}');
    
    console.log('요청 데이터:', { action, table, query });

    let result;

    switch (action) {
      case 'insert':
        result = await supabase.from(table).insert(data).select();
        break;

      case 'select':
        if (query && typeof query === 'object') {
          let queryBuilder = supabase.from(table).select('*');
          
          Object.keys(query).forEach(key => {
            const value = query[key];
            
            if (typeof value === 'string') {
              if (value.startsWith('%') && value.endsWith('%')) {
                const searchTerm = value.slice(1, -1);
                queryBuilder = queryBuilder.ilike(key, `%${searchTerm}%`);
              } else if (value.startsWith('%')) {
                const searchTerm = value.slice(1);
                queryBuilder = queryBuilder.ilike(key, `%${searchTerm}`);
              } else if (value.endsWith('%')) {
                const searchTerm = value.slice(0, -1);
                queryBuilder = queryBuilder.ilike(key, `${searchTerm}%`);
              } else {
                queryBuilder = queryBuilder.eq(key, value);
              }
            } else {
              queryBuilder = queryBuilder.eq(key, value);
            }
          });
          
          result = await queryBuilder;
        } else {
          result = await supabase.from(table).select('*');
        }
        break;

      case 'update':
        result = await supabase.from(table).update(data).eq('id', query.id).select();
        break;

      case 'delete':
        result = await supabase.from(table).delete().eq('id', query.id);
        break;

      default:
        throw new Error('지원하지 않는 액션입니다.');
    }

    console.log('쿼리 결과:', result);
    return { statusCode: 200, headers, body: JSON.stringify(result) };

  } catch (error) {
    console.error('Supabase 프록시 오류:', error);
    console.error('오류 스택:', error.stack);
    return { statusCode: 500, headers, body: JSON.stringify({ error: error.message }) };
  }
}; 