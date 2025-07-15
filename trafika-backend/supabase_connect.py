import os
from supabase import create_client, Client
from dotenv import load_dotenv

# 환경변수 로드
load_dotenv()

# Supabase 연결 정보
url = "https://dknogagzoarrcwuuiavm.supabase.co"
key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRrbm9nYWd6b2FycmN3dXVpYXZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1NTA0MDIsImV4cCI6MjA2ODEyNjQwMn0.P6RZwUTVLNm-jxH9bB5OrJzirG5lI-kL2UBT0P7La7Y"

if not url or not key:
    print("환경변수 SUPABASE_URL과 SUPABASE_ANON_KEY를 설정해주세요.")
    exit(1)

# Supabase 클라이언트 생성
supabase: Client = create_client(url, key)

def check_table_exists():
    """테이블이 존재하는지 확인합니다."""
    try:
        # 전체 데이터를 가져와서 컬럼 구조 확인
        response = supabase.table("delisted_stocks").select("*").limit(1).execute()
        print(f"테이블 존재 확인: {response}")
        if response.data and len(response.data) > 0:
            print(f"첫 번째 행의 컬럼들: {list(response.data[0].keys())}")
        return True
    except Exception as e:
        print(f"테이블 확인 중 오류: {e}")
        return False

def get_delisted_stocks(limit=10):
    """폐지된 주식 데이터를 조회합니다."""
    try:
        print(f"Supabase 연결 시도 중... URL: {url}")
        response = supabase.table("delisted_stocks").select("*").limit(limit).execute()
        print(f"응답 받음: {response}")
        print(f"데이터 개수: {len(response.data) if response.data else 0}")
        return response.data
    except Exception as e:
        print(f"데이터 조회 중 오류 발생: {e}")
        print(f"오류 타입: {type(e)}")
        return None

def get_stocks_by_year(year):
    """특정 연도에 폐지된 주식들을 조회합니다."""
    try:
        response = supabase.table("delisted_stocks").select("*").eq("폐지연도", str(year)).execute()
        return response.data
    except Exception as e:
        print(f"연도별 데이터 조회 중 오류 발생: {e}")
        return None

def get_stocks_by_market(market):
    """특정 시장(KOSPI, KOSDAQ)의 폐지된 주식들을 조회합니다."""
    try:
        response = supabase.table("delisted_stocks").select("*").eq("market", market).execute()
        return response.data
    except Exception as e:
        print(f"시장별 데이터 조회 중 오류 발생: {e}")
        return None

if __name__ == "__main__":
    print("=== 폐지된 주식 데이터 조회 ===")
    
    # 테이블 존재 확인
    print("\n0. 테이블 존재 확인:")
    if check_table_exists():
        print("테이블이 존재합니다.")
    else:
        print("테이블이 존재하지 않거나 접근할 수 없습니다.")
        exit(1)
    
    # 전체 데이터 10개 조회
    print("\n1. 최근 10개 데이터:")
    data = get_delisted_stocks(10)
    if data and len(data) > 0:
        for item in data:
            print(f"티커: {item.get('tic')}, 회사명: {item.get('name')}, 시장: {item.get('market')}, 폐지일: {item.get('delistingdate')}")
    else:
        print("데이터를 가져올 수 없거나 데이터가 없습니다.")
    
    # 2020년 폐지된 주식들 조회
    print("\n2. 2020년 폐지된 주식들:")
    data_2020 = get_stocks_by_year(2020)
    if data_2020 and len(data_2020) > 0:
        for item in data_2020:
            print(f"티커: {item.get('tic')}, 회사명: {item.get('name')}, 폐지일: {item.get('delistingdate')}")
    else:
        print("2020년 데이터가 없습니다.")
    
    # KOSPI 시장 폐지 주식들 조회
    print("\n3. KOSPI 시장 폐지 주식들 (최근 5개):")
    kospi_data = get_stocks_by_market("KOSPI")
    if kospi_data and len(kospi_data) > 0:
        for item in kospi_data[:5]:
            print(f"티커: {item.get('tic')}, 회사명: {item.get('name')}, 폐지일: {item.get('delistingdate')}")
    else:
        print("KOSPI 데이터가 없습니다.") 