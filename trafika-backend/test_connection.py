from supabase import create_client, Client

# Supabase 연결 정보
url = "https://dknogagzoarrcwuuiavm.supabase.co"
key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRrbm9nYWd6b2FycmN3dXVpYXZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1NTA0MDIsImV4cCI6MjA2ODEyNjQwMn0.P6RZwUTVLNm-jxH9bB5OrJzirG5lI-kL2UBT0P7La7Y"

# Supabase 클라이언트 생성
supabase: Client = create_client(url, key)

print("=== Supabase 연결 테스트 ===")

try:
    # 1. 테이블 존재 확인 (RLS 우회 시도)
    print("1. RLS 우회 시도...")
    response = supabase.table("delisted_stocks").select("*").limit(1).execute()
    print(f"응답: {response}")
    
    # 2. 다른 방법으로 시도 - 특정 컬럼만 선택
    print("\n2. 특정 컬럼 선택 시도...")
    try:
        # 이미지에서 보이는 컬럼명들로 시도
        response2 = supabase.table("delisted_stocks").select("name, market, delistingdate").limit(1).execute()
        print(f"특정 컬럼 응답: {response2}")
    except Exception as e:
        print(f"특정 컬럼 오류: {e}")
    
    # 3. 스키마 확인
    print("\n3. 다른 스키마 시도...")
    try:
        response3 = supabase.from_("delisted_stocks").select("*").limit(1).execute()
        print(f"from_ 메서드 응답: {response3}")
    except Exception as e:
        print(f"from_ 메서드 오류: {e}")
    
    # 4. 테이블 목록 확인
    print("\n4. 사용 가능한 테이블 확인...")
    try:
        # 시스템 테이블에서 테이블 목록 조회
        tables_response = supabase.rpc('get_tables').execute()
        print(f"테이블 목록: {tables_response}")
    except Exception as e:
        print(f"테이블 목록 조회 오류: {e}")
    
    # 5. 직접 SQL 쿼리 시도
    print("\n5. SQL 쿼리 시도...")
    try:
        sql_response = supabase.rpc('exec_sql', {'query': 'SELECT * FROM delisted_stocks LIMIT 1'}).execute()
        print(f"SQL 응답: {sql_response}")
    except Exception as e:
        print(f"SQL 쿼리 오류: {e}")

except Exception as e:
    print(f"❌ 메인 오류 발생: {e}")
    print(f"오류 타입: {type(e)}")

print("\n=== 해결 방법 ===")
print("1. Supabase Dashboard에서 RLS 정책을 확인하세요")
print("2. 'Enable RLS'가 켜져 있다면 끄거나 정책을 수정하세요")
print("3. 또는 anon key 대신 service_role key를 사용하세요")
print("4. 테이블이 public 스키마에 있는지 확인하세요") 