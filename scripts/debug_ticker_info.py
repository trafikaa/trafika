import os
import requests
from dotenv import load_dotenv

# .env 파일 로드
load_dotenv()

def debug_ticker_info():
    """ticker_info 테이블 구조를 확인하는 함수"""
    
    supabase_url = os.getenv('SUPABASE_URL')
    supabase_key = os.getenv('SUPABASE_ANON_KEY')
    
    if not supabase_url or not supabase_key:
        print("❌ 환경 변수가 설정되지 않았습니다.")
        return
    
    try:
        # ticker_info 테이블 조회 (필터링 없이)
        url = f"{supabase_url}/rest/v1/ticker_info"
        headers = {
            'apikey': supabase_key,
            'Authorization': f'Bearer {supabase_key}',
            'Content-Type': 'application/json'
        }
        
        # 먼저 전체 데이터 구조 확인
        response = requests.get(url, headers=headers)
        print(f"ticker_info 테이블 조회: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"전체 데이터 개수: {len(data)}")
            
            if data:
                print("첫 번째 레코드 구조:")
                first_record = data[0]
                for key, value in first_record.items():
                    print(f"  {key}: {value}")
                
                # listed_company 값들의 분포 확인
                listed_values = {}
                for item in data:
                    listed_val = item.get('listed_company')
                    if listed_val not in listed_values:
                        listed_values[listed_val] = 0
                    listed_values[listed_val] += 1
                
                print(f"\nlisted_company 값 분포:")
                for value, count in listed_values.items():
                    print(f"  {value}: {count}개")
                
                # listed_company = 0인 기업들 확인
                delisted_companies = [item for item in data if item.get('listed_company') == 0]
                print(f"\n상장 폐지 기업 수: {len(delisted_companies)}")
                
                if delisted_companies:
                    print("상장 폐지 기업 예시:")
                    for i, company in enumerate(delisted_companies[:3]):
                        print(f"  {i+1}. {company.get('company_name')} ({company.get('ticker')}) - listed_company: {company.get('listed_company')}")
                
                # delisting_date 컬럼이 있는지 확인
                has_delisting_date = any('delisting_date' in item.keys() for item in data)
                print(f"\ndelisting_date 컬럼 존재: {has_delisting_date}")
                
                if has_delisting_date:
                    # delisting_date가 있는 기업들 확인
                    with_delisting_date = [item for item in data if item.get('delisting_date')]
                    print(f"delisting_date가 있는 기업 수: {len(with_delisting_date)}")
                    
                    if with_delisting_date:
                        print("delisting_date 예시:")
                        for i, company in enumerate(with_delisting_date[:3]):
                            print(f"  {i+1}. {company.get('company_name')} - {company.get('delisting_date')}")
            else:
                print("❌ ticker_info 테이블에 데이터가 없습니다.")
        else:
            print(f"❌ ticker_info 테이블 조회 실패: {response.text}")
            
    except Exception as e:
        print(f"ticker_info 테이블 조회 오류: {e}")

if __name__ == "__main__":
    debug_ticker_info() 