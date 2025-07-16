# 상장폐지 기업들의 재무제표를 가져오는 코드
# DART API를 통해 상장폐지 전까지의 재무제표 수집
import requests
import pandas as pd
import time
import re
from supabase import create_client

# :열쇠: API Key
API_KEY = 'a94c626714100c24b572d891153cf378328e7348'

# Supabase 연결 정보
SUPABASE_URL = "https://dknogagzoarrcwuuiavm.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRrbm9nYWd6b2FycmN3dXVpYXZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1NTA0MDIsImV4cCI6MjA2ODEyNjQwMn0.P6RZwUTVLNm-jxH9bB5OrJzirG5lI-kL2UBT0P7La7Y"

# Supabase 클라이언트 생성
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# 보고서 코드
REPORT_CODES = {
    "q1": "11013",
    "semi": "11012",
    "q3": "11014",
    "annual": "11011"
}
FS_PRIORITY = ["CFS", "OFS"]

# 저장할 전체 필드 목록
FULL_COLUMNS = [
    "ticker", "corp_name", "bsns_year", "account_id",
    "account_nm", "sj_div",
    "thstrm_amount", "thstrm_add_amount",
    "frmtrm_amount", "frmtrm_add_amount",
    "bfefrmtrm_amount", "currency", "delisting_year"
]

def to_numeric_safe(val):
    try:
        return float(str(val).replace(",", "").strip()) if val else None
    except:
        return None

def read_delisted_companies(file_path='src_data/delisted_stocks_2005_2025.csv'):
    """상장폐지 기업 목록을 읽어옵니다"""
    df = pd.read_csv(file_path)
    # 상장폐지 연도가 2005년 이후인 기업들만 필터링
    df = df[df['폐지연도'] >= 2005].copy()
    return df

def get_corp_code_by_ticker(ticker):
    """ticker로 기업코드를 찾는 함수 (DART API 사용)"""
    url = "https://opendart.fss.or.kr/api/company.json"
    params = {
        "crtfc_key": API_KEY,
        "corp_code": ticker
    }
    try:
        response = requests.get(url, params=params)
        data = response.json()
        if data.get("status") == "000":
            return data.get("corp_code")
    except Exception as e:
        print(f"[ERROR] 기업코드 조회 실패 ({ticker}): {e}")
    return None

def get_existing_tickers_from_db(table_name):
    try:
        response = supabase.table(table_name).select("ticker").execute()
        return set(row['ticker'] for row in response.data)
    except Exception as e:
        print(f"[ERROR] 기존 ticker 조회 실패: {e}")
        return set()

def fetch_financial_data(corp_code, year, reprt_code):
    corp_code = str(corp_code).zfill(8)
    for fs_div in FS_PRIORITY:
        url = "https://opendart.fss.or.kr/api/fnlttSinglAcntAll.json"
        params = {
            "crtfc_key": API_KEY,
            "corp_code": corp_code,
            "bsns_year": year,
            "reprt_code": reprt_code,
            "fs_div": fs_div
        }
        try:
            response = requests.get(url, params=params)
            data = response.json()
            if data.get("status") == "000" and data.get("list"):
                return data["list"]
            elif data.get("status") == "013":
                continue
        except Exception as e:
            print(f"[ERROR] API 요청 실패: {e}")
    return []

def clean_text(text):
    if not isinstance(text, str):
        return text
    return re.sub(r"\s+", "", text)

def parse_full_response(response, ticker, corp_name, delisting_year):
    parsed = []
    for item in response:
        if item.get("sj_div") == "SCE": # 자본변동표는 제외하고 저장
            continue
        row = {
            "ticker": ticker,
            "corp_name": corp_name,
            "bsns_year": item.get("bsns_year"),
            "account_id": item.get("account_id"),
            "account_nm": clean_text(item.get("account_nm")),
            "sj_div": item.get("sj_div"),
            "thstrm_amount": to_numeric_safe(item.get("thstrm_amount")),
            "thstrm_add_amount": to_numeric_safe(item.get("thstrm_add_amount")),
            "frmtrm_amount": to_numeric_safe(item.get("frmtrm_amount")),
            "frmtrm_add_amount": to_numeric_safe(item.get("frmtrm_add_amount")),
            "bfefrmtrm_amount": to_numeric_safe(item.get("bfefrmtrm_amount")),
            "currency": item.get("currency"),
            "delisting_year": delisting_year
        }
        parsed.append(row)
    return parsed

def save_to_supabase(table_name, data_rows):
    if not data_rows:
        print(f"[INFO] 저장할 데이터 없음 → {table_name}")
        return
    try:
        # Supabase에 데이터 삽입
        response = supabase.table(table_name).insert(data_rows).execute()
        print(f"[OK] 저장 완료 → {table_name} ({len(data_rows)}건)")
    except Exception as e:
        print(f"[ERROR] Supabase 저장 실패: {e}")

def main():
    """상장폐지 기업들의 재무제표를 수집합니다"""
    delisted_df = read_delisted_companies()
    print(f"총 {len(delisted_df)}개 상장폐지 기업 발견")
    
    for report_name, reprt_code in REPORT_CODES.items():
        table_name = f"dart_delisted_{report_name}"
        existing_tickers = get_existing_tickers_from_db(table_name)
        
        for _, row in delisted_df.iterrows():
            ticker = row["ticker"]
            corp_name = row["name"]
            delisting_year = row["폐지연도"]
            
            if ticker in existing_tickers:
                print(f"[SKIP] 이미 처리됨: {ticker} ({corp_name})")
                continue
                
            print(f"[PROCESS] 처리 중: {ticker} ({corp_name}) - 상장폐지: {delisting_year}년")
            
            # 기업코드 찾기 (ticker를 기업코드로 변환)
            corp_code = get_corp_code_by_ticker(ticker)
            if not corp_code:
                print(f"[ERROR] 기업코드를 찾을 수 없음: {ticker}")
                continue
            
            # 상장폐지 연도까지의 데이터 수집
            start_year = 2005
            end_year = min(delisting_year, 2025)
            
            for year in range(start_year, end_year + 1):
                print(f"  → {year}년 데이터 수집 중...")
                response = fetch_financial_data(corp_code, year, reprt_code)
                parsed_rows = parse_full_response(response, ticker, corp_name, delisting_year)
                save_to_supabase(table_name, parsed_rows)
                time.sleep(0.3)  # API 호출 제한 고려
            
            print(f"[COMPLETE] {ticker} 완료")

# 실행
if __name__ == "__main__":
    print("=== 상장폐지 기업 재무제표 수집 시작 ===")
    main()
    print("=== 수집 완료 ===") 