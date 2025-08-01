export const supabaseProxy = {
    async insert(table: string, data: any) {
      const response = await fetch('/.netlify/functions/supabaseProxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'insert',
          table,
          data,
        }),
      });
  
      if (!response.ok) {
        throw new Error('데이터 삽입 실패');
      }
  
      return response.json();
    },
  
    async select(table: string, query?: any) {
      console.log('Supabase 쿼리 요청:', { table, query });
      
      const response = await fetch('/.netlify/functions/supabaseProxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'select',
          table,
          query,
        }),
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Supabase 응답 오류:', {
          status: response.status,
          statusText: response.statusText,
          errorText
        });
        throw new Error(`데이터 조회 실패: ${response.status} ${response.statusText}`);
      }
  
      const result = await response.json();
      console.log('Supabase 쿼리 결과:', result);
      return result;
    },
  
    async update(table: string, id: string, data: any) {
      const response = await fetch('/.netlify/functions/supabaseProxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'update',
          table,
          data,
          query: { id },
        }),
      });
  
      if (!response.ok) {
        throw new Error('데이터 수정 실패');
      }
  
      return response.json();
    },
  
    async delete(table: string, id: string) {
      const response = await fetch('/.netlify/functions/supabaseProxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'delete',
          table,
          query: { id },
        }),
      });
  
      if (!response.ok) {
        throw new Error('데이터 삭제 실패');
      }
  
      return response.json();
    },
  };