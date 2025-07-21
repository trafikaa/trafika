import os
import requests
from dotenv import load_dotenv

# .env 파일 로드
load_dotenv()

def debug_supabase_connection():
    """Supabase 연결과 테이블 구조를 확인하는 함수"""
    
    supabase_url = os.getenv('SUPABASE_URL')
    supabase_key = os.getenv('SUPABASE_ANON_KEY')
    
    print(f"Supabase URL: {supabase_url}")
    print(f"Supabase Key: {supabase_key[:20]}..." if supabase_key else "None")
    
    if not supabase_url or not supabase_key:
        print("❌ 환경 변수가 설정되지 않았습니다.")
        return
    
    # 1. 기본 연결 테스트
    try:
        url = f"{supabase_url}/rest/v1/"
        headers = {
            'apikey': supabase_key,
            'Authorization': f'Bearer {supabase_key}',
            'Content-Type': 'application/json'
        }
        
        response = requests.get(url, headers=headers)
        print(f"기본 연결 테스트: {response.status_code}")
        
        if response.status_code == 200:
            print("✅ Supabase 연결 성공")
        else:
            print(f"❌ 연결 실패: {response.text}")
            return
            
    except Exception as e:
        print(f"❌ 연결 오류: {e}")
        return
    
    # 2. 사용 가능한 테이블 확인
    try:
        # PostgreSQL의 시스템 테이블을 통해 테이블 목록 조회
        url = f"{supabase_url}/rest/v1/rpc/get_tables"
        headers = {
            'apikey': supabase_key,
            'Authorization': f'Bearer {supabase_key}',
            'Content-Type': 'application/json'
        }
        
        response = requests.post(url, headers=headers, json={})
        print(f"테이블 목록 조회: {response.status_code}")
        
        if response.status_code == 200:
            tables = response.json()
            print("사용 가능한 테이블:")
            for table in tables:
                print(f"  - {table}")
        else:
            print(f"테이블 목록 조회 실패: {response.text}")
            
    except Exception as e:
        print(f"테이블 목록 조회 오류: {e}")
    
    # 3. delisted_stocks 테이블 직접 테스트
    try:
        url = f"{supabase_url}/rest/v1/delisted_stocks"
        headers = {
            'apikey': supabase_key,
            'Authorization': f'Bearer {supabase_key}',
            'Content-Type': 'application/json'
        }
        
        # 먼저 테이블 존재 여부만 확인
        response = requests.get(url, headers=headers)
        print(f"delisted_stocks 테이블 테스트: {response.status_code}")
        
        if response.status_code == 200:
            print("✅ delisted_stocks 테이블 존재")
            data = response.json()
            print(f"데이터 개수: {len(data)}")
            if data:
                print("첫 번째 레코드 예시:")
                print(data[0])
        elif response.status_code == 404:
            print("❌ delisted_stocks 테이블이 존재하지 않습니다.")
        else:
            print(f"❌ 테이블 접근 오류: {response.text}")
            
    except Exception as e:
        print(f"delisted_stocks 테이블 테스트 오류: {e}")
    
    # 4. 다른 가능한 테이블명들 테스트
    possible_tables = ['delisted_corp', 'delisted_corp_basic', 'delisted_corp_delisting']
    
    for table_name in possible_tables:
        try:
            url = f"{supabase_url}/rest/v1/{table_name}"
            headers = {
                'apikey': supabase_key,
                'Authorization': f'Bearer {supabase_key}',
                'Content-Type': 'application/json'
            }
            
            response = requests.get(url, headers=headers)
            print(f"{table_name} 테이블 테스트: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                print(f"  ✅ {table_name} 테이블 존재 (데이터 {len(data)}개)")
                if data:
                    print(f"  컬럼: {list(data[0].keys())}")
            elif response.status_code == 404:
                print(f"  ❌ {table_name} 테이블 없음")
            else:
                print(f"  ❌ {table_name} 접근 오류: {response.text}")
                
        except Exception as e:
            print(f"  ❌ {table_name} 테스트 오류: {e}")

if __name__ == "__main__":
    debug_supabase_connection() 