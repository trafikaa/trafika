import os
import pandas as pd
import requests
import json
from dotenv import load_dotenv

# .env 파일 로드
load_dotenv()

class SupabaseUploader:
    def __init__(self):
        self.supabase_url = os.getenv('SUPABASE_URL')
        self.supabase_key = os.getenv('SUPABASE_ANON_KEY')
        
        if not self.supabase_url or not self.supabase_key:
            raise ValueError("Supabase URL과 API 키가 필요합니다. .env 파일을 확인해주세요.")
    
    def check_table_structure(self):
        """테이블 구조 확인"""
        url = f"{self.supabase_url}/rest/v1/delisted_ratios"
        headers = {
            'apikey': self.supabase_key,
            'Authorization': f'Bearer {self.supabase_key}',
            'Content-Type': 'application/json'
        }
        
        try:
            response = requests.get(url, headers=headers, params={'limit': 1})
            if response.status_code == 200:
                print("✅ delisted_ratios 테이블에 접근 가능합니다.")
                return True
            else:
                print(f"❌ 테이블 접근 실패: {response.status_code}")
                return False
        except Exception as e:
            print(f"테이블 확인 중 오류: {e}")
            return False
    
    def upload_data(self, csv_file):
        """CSV 데이터를 Supabase에 업로드"""
        # CSV 파일 읽기
        df = pd.read_csv(csv_file)
        print(f"CSV 파일 읽기 완료: {len(df)}개 행")
        
        # 데이터 전처리
        data = []
        for _, row in df.iterrows():
            processed_row = {}
            
            for column, value in row.items():
                if column == 'ticker':
                    # ticker를 6자리 형태로 맞춤 (앞에 0 추가)
                    if pd.notna(value):
                        ticker_str = str(value).zfill(6)  # 6자리로 맞춤
                        processed_row[column] = ticker_str
                    else:
                        processed_row[column] = None
                elif column == 'year':
                    processed_row[column] = str(value) if pd.notna(value) else None
                else:
                    # numeric 컬럼들 처리
                    if pd.isna(value) or pd.isnull(value):
                        processed_row[column] = None
                    elif isinstance(value, (int, float)):
                        # 무한대 값이나 매우 큰 값 처리
                        if pd.isna(value) or abs(value) > 1e15:
                            processed_row[column] = None
                        else:
                            processed_row[column] = float(value)
                    else:
                        # 문자열을 숫자로 변환 시도
                        try:
                            num_value = float(value)
                            if abs(num_value) > 1e15:
                                processed_row[column] = None
                            else:
                                processed_row[column] = num_value
                        except (ValueError, TypeError):
                            processed_row[column] = None
            
            data.append(processed_row)
        
        print(f"데이터 전처리 완료: {len(data)}개 행")
        
        # Supabase에 업로드
        url = f"{self.supabase_url}/rest/v1/delisted_ratios"
        headers = {
            'apikey': self.supabase_key,
            'Authorization': f'Bearer {self.supabase_key}',
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
        }
        
        try:
            response = requests.post(url, headers=headers, json=data)
            if response.status_code == 201:
                print(f"✅ 데이터 업로드 완료: {len(data)}개 행")
                return True
            else:
                print(f"❌ 데이터 업로드 실패: {response.status_code}")
                print(response.text)
                return False
        except Exception as e:
            print(f"데이터 업로드 중 오류: {e}")
            return False

def main():
    try:
        uploader = SupabaseUploader()
        
        # 테이블 구조 확인
        if not uploader.check_table_structure():
            print("테이블에 접근할 수 없습니다. Supabase 대시보드에서 테이블을 확인해주세요.")
            return
        
        # 데이터 업로드
        csv_file = "data/delisted_financials_with_metrics.csv"
        if not os.path.exists(csv_file):
            print(f"CSV 파일을 찾을 수 없습니다: {csv_file}")
            return
        
        if uploader.upload_data(csv_file):
            print("🎉 데이터 업로드가 완료되었습니다!")
        else:
            print("데이터 업로드에 실패했습니다.")
            
    except Exception as e:
        print(f"오류 발생: {e}")

if __name__ == "__main__":
    main()
