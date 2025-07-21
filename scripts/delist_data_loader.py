import os
import requests
import pandas as pd
import json
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional, Tuple
from dotenv import load_dotenv
import time

# .env 파일 로드
load_dotenv()

class DelistDataLoader:
    def __init__(self):
        """
        상장 폐지 기업 재무 데이터 로더 초기화
        """
        self.supabase_url = os.getenv('SUPABASE_URL')
        self.supabase_key = os.getenv('SUPABASE_ANON_KEY')
        self.dart_api_key = os.getenv('DART_API_KEY')
        
        if not self.supabase_url or not self.supabase_key:
            raise ValueError("Supabase URL과 API 키가 필요합니다. .env 파일을 확인해주세요.")
        
        if not self.dart_api_key:
            raise ValueError("DART API 키가 필요합니다. .env 파일을 확인해주세요.")
        
        self.dart_base_url = "https://opendart.fss.or.kr/api"
        
    def get_delisted_companies(self) -> List[Dict[str, Any]]:
        """
        Supabase의 ticker_info와 delisted_stocks 테이블에서 상장 폐지된 기업 목록 가져오기
        
        Returns:
            List[Dict[str, Any]]: 상장 폐지 기업 목록
        """
        try:
            # 1. ticker_info에서 상장 폐지 기업 목록 가져오기
            url = f"{self.supabase_url}/rest/v1/ticker_info"
            headers = {
                'apikey': self.supabase_key,
                'Authorization': f'Bearer {self.supabase_key}',
                'Content-Type': 'application/json'
            }
            
            # listed_company = 0인 기업들만 조회 (상장 폐지된 기업)
            params = {
                'select': 'ticker,corp_name,corp_code,listed_company',
                'listed_company': 'eq.0'
            }
            
            response = requests.get(url, headers=headers, params=params)
            response.raise_for_status()
            
            companies = response.json()
            print(f"ticker_info에서 상장 폐지 기업 {len(companies)}개 발견")
            
            if not companies:
                print("⚠️ ticker_info 테이블에서 상장 폐지 기업을 찾을 수 없습니다.")
                return []
            
            # 2. delisted_stocks에서 폐지일 정보 가져오기
            delisted_stocks_url = f"{self.supabase_url}/rest/v1/delisted_stocks"
            delisted_response = requests.get(delisted_stocks_url, headers=headers)
            
            if delisted_response.status_code == 200:
                delisted_data = delisted_response.json()
                print(f"delisted_stocks에서 {len(delisted_data)}개 레코드 발견")
                
                # ticker를 키로 하는 딕셔너리 생성
                delisting_dates = {}
                for item in delisted_data:
                    ticker = item.get('ticker')
                    delisting_date = item.get('delisting_date')
                    if ticker and delisting_date:
                        delisting_dates[ticker] = delisting_date
                
                # 각 기업에 폐지일 정보 추가
                for company in companies:
                    ticker = company.get('ticker')
                    if ticker in delisting_dates:
                        company['delisting_date'] = delisting_dates[ticker]
                    else:
                        print(f"⚠️ {ticker}의 폐지일 정보를 찾을 수 없습니다.")
                        company['delisting_date'] = None
            else:
                print(f"⚠️ delisted_stocks 테이블 조회 실패: {delisted_response.status_code}")
                
            
            return companies
            
        except Exception as e:
            print(f"상장 폐지 기업 목록 조회 중 오류 발생: {e}")
            return []
    
    def calculate_target_year(self, delisting_date: str) -> str:
        """
        폐지 직전년도 계산
        
        Args:
            delisting_date (str): 폐지일 (YYYY-MM-DD 형식)
            
        Returns:
            str: 대상 연도 (YYYY 형식)
        """
        try:
            if not delisting_date:
                print("⚠️ 폐지일 정보가 없습니다. 기본값 2022년을 사용합니다.")
                return "2022"
            
            # 폐지일에서 연도만 추출하고 -1
            year = int(delisting_date[:4])
            target_year = str(year - 1)
            
            print(f"폐지일: {delisting_date} → 대상연도: {target_year}")
            return target_year
            
        except Exception as e:
            print(f"연도 계산 중 오류 발생: {e}")
            return None
    
    def search_company_by_corp_code(self, corp_code: str) -> Optional[Dict[str, Any]]:
        """
        기업 코드로 기업 정보 검색
        
        Args:
            corp_code (str): 기업 코드
            
        Returns:
            Optional[Dict[str, Any]]: 기업 정보
        """
        url = f"{self.dart_base_url}/company.json"
        params = {
            'crtfc_key': self.dart_api_key,
            'corp_code': corp_code
        }
        
        try:
            response = requests.get(url, params=params)
            response.raise_for_status()
            data = response.json()
            
            if data.get('status') == '000' and data.get('list'):
                return data['list'][0]
            else:
                print(f"기업 코드 {corp_code} 검색 실패: {data.get('message', '알 수 없는 오류')}")
                return None
                
        except Exception as e:
            print(f"기업 검색 중 오류 발생: {e}")
            return None
    
    def get_financial_statements(self, corp_code: str, year: str, fs_div: str = "CFS") -> List[Dict[str, Any]]:
        """
        재무제표 데이터 조회
        
        Args:
            corp_code (str): 기업 코드
            year (str): 연도
            fs_div (str): 재무제표 구분 (CFS: 연결재무제표, OFS: 개별재무제표)
            
        Returns:
            List[Dict[str, Any]]: 재무제표 데이터 목록
        """
        url = f"{self.dart_base_url}/fnlttSinglAcntAll.json"
        params = {
            'crtfc_key': self.dart_api_key,
            'corp_code': corp_code,
            'bsns_year': year,
            'reprt_code': '11011',  # 사업보고서
            'fs_div': fs_div
        }
        
        try:
            response = requests.get(url, params=params)
            response.raise_for_status()
            data = response.json()
            
            if data.get('status') == '000':
                return data.get('list', [])
            else:
                print(f"재무제표 조회 실패 ({fs_div}): {data.get('message', '알 수 없는 오류')}")
                return []
                
        except Exception as e:
            print(f"재무제표 조회 중 오류 발생 ({fs_div}): {e}")
            return []
    
    def get_financial_data_with_priority(self, corp_code: str, year: str) -> Tuple[List[Dict[str, Any]], str]:
        """
        재무제표 우선순위 적용하여 데이터 조회
        
        Args:
            corp_code (str): 기업 코드
            year (str): 연도
            
        Returns:
            Tuple[List[Dict[str, Any]], str]: (재무제표 데이터, 사용된 재무제표 구분)
        """
        print(f"재무제표 데이터 조회 시작: {year}년")
        
        # 1차 시도: 연결재무제표(CFS)
        print("1차 시도: 연결재무제표(CFS) 조회")
        cfs_data = self.get_financial_statements(corp_code, year, "CFS")
        
        if cfs_data and len(cfs_data) > 0:
            print(f"✅ 연결재무제표 데이터 {len(cfs_data)}개 항목 발견")
            return cfs_data, "CFS"
        
        # 2차 시도: 개별재무제표(OFS)
        print("2차 시도: 개별재무제표(OFS) 조회")
        ofs_data = self.get_financial_statements(corp_code, year, "OFS")
        
        if ofs_data and len(ofs_data) > 0:
            print(f"✅ 개별재무제표 데이터 {len(ofs_data)}개 항목 발견")
            return ofs_data, "OFS"
        
        print("❌ 재무제표 데이터를 찾을 수 없습니다.")
        return [], ""
    
    def __init__(self):
        """
        상장 폐지 기업 재무 데이터 로더 초기화
        """
        self.supabase_url = os.getenv('SUPABASE_URL')
        self.supabase_key = os.getenv('SUPABASE_ANON_KEY')
        self.dart_api_key = os.getenv('DART_API_KEY')
        
        if not self.supabase_url or not self.supabase_key:
            raise ValueError("Supabase URL과 API 키가 필요합니다. .env 파일을 확인해주세요.")
        
        if not self.dart_api_key:
            raise ValueError("DART API 키가 필요합니다. .env 파일을 확인해주세요.")
        
        self.dart_base_url = "https://opendart.fss.or.kr/api"
        
        # CSV 데이터를 저장할 리스트
        self.all_csv_data = []
    
    def process_delisted_company(self, company: Dict[str, Any]) -> bool:
        """
        상장 폐지 기업 데이터 처리
        
        Args:
            company (Dict[str, Any]): 기업 정보
            
        Returns:
            bool: 처리 성공 여부
        """
        ticker = company.get('ticker')
        corp_code = company.get('corp_code')
        company_name = company.get('company_name')
        delisting_date = company.get('delisting_date')
        
        print(f"\n처리 중: {company_name} ({ticker})")
        print(f"폐지일: {delisting_date}")
        
        if not corp_code:
            print(f"기업 코드가 없습니다: {ticker}")
            return False
        
        if not delisting_date:
            print(f"폐지일이 없습니다: {ticker}")
            print("기본값 2022년을 사용합니다.")
            target_year = "2022"
        else:
            # 폐지 직전년도 계산
            target_year = self.calculate_target_year(delisting_date)
        

        
        # 재무제표 데이터 조회 (우선순위 적용)
        financial_data, fs_div = self.get_financial_data_with_priority(corp_code, target_year)
        
        if not financial_data:
            print(f"재무제표 데이터가 없습니다: {ticker}")
            return False
        
        # CSV 데이터 수집
        success = self.collect_financial_data_for_csv(ticker, target_year, financial_data, fs_div)
        
        if success:
            print(f"✅ {company_name} ({ticker}) 데이터 처리 완료")
        else:
            print(f"❌ {company_name} ({ticker}) 데이터 처리 실패")
        
        return success
    
    def collect_financial_data_for_csv(self, ticker: str, year: str, financial_data: List[Dict[str, Any]], fs_div: str) -> bool:
        """
        재무 데이터를 CSV용으로 수집
        
        Args:
            ticker (str): 종목 코드
            year (str): 연도
            financial_data (List[Dict[str, Any]]): 재무 데이터
            fs_div (str): 재무제표 구분
            
        Returns:
            bool: 수집 성공 여부
        """
        try:
            # 데이터 변환
            for item in financial_data:
                # 금액 데이터 숫자형 변환
                this_term_amount = item.get('thstrm_amount', '0')
                prev_term_amount = item.get('frmtrm_amount', '0')
                
                try:
                    this_term_amount = float(this_term_amount.replace(',', '')) if this_term_amount and this_term_amount != '-' else 0
                except:
                    this_term_amount = 0
                    
                try:
                    prev_term_amount = float(prev_term_amount.replace(',', '')) if prev_term_amount and prev_term_amount != '-' else 0
                except:
                    prev_term_amount = 0
                
                csv_row = {
                    'ticker': ticker,
                    'year': year,
                    'account_id': item.get('account_id', ''),
                    'account_nm': item.get('account_nm', '').strip(),
                    'account_detail': item.get('account_detail', ''),
                    'this_term_amount': this_term_amount,
                    'prev_term_amount': prev_term_amount,
                    'statement_name': item.get('sj_nm', ''),
                    'fs_div': fs_div
                }
                self.all_csv_data.append(csv_row)
            
            print(f"{ticker} {year}년 데이터 수집 완료 ({len(financial_data)}개 항목, {fs_div})")
            return True
            
        except Exception as e:
            print(f"데이터 수집 중 오류 발생: {e}")
            return False
    
    def save_all_data_to_csv(self):
        """
        수집된 모든 데이터를 하나의 CSV 파일로 저장
        """
        try:
            if not self.all_csv_data:
                print("저장할 데이터가 없습니다.")
                return
            
            # CSV 파일명 생성
            csv_filename = "data/delisted_financials_all.csv"
            
            # data 폴더가 없으면 생성
            os.makedirs("data", exist_ok=True)
            
            # DataFrame으로 변환하여 CSV 저장
            df = pd.DataFrame(self.all_csv_data)
            df.to_csv(csv_filename, index=False, encoding='utf-8-sig')
            
            print(f"전체 데이터 CSV 저장 완료 ({len(self.all_csv_data)}개 항목)")
            print(f"파일 위치: {csv_filename}")
            
        except Exception as e:
            print(f"CSV 저장 중 오류 발생: {e}")
    
    def process_all_delisted_companies(self, limit: Optional[int] = None):
        """
        모든 상장 폐지 기업 데이터 처리
        
        Args:
            limit (Optional[int]): 처리할 기업 수 제한 (테스트용)
        """
        print("상장 폐지 기업 재무 데이터 수집 시작")
        print("전략: 폐지 직전년도 사업보고서 → 연결재무제표(CFS) → 개별재무제표(OFS)")
        
        # 상장 폐지 기업 목록 가져오기
        companies = self.get_delisted_companies()
        
        if not companies:
            print("상장 폐지 기업이 없습니다.")
            return
        
        if limit:
            companies = companies[:limit]
            print(f"테스트 모드: {limit}개 기업만 처리")
        
        success_count = 0
        total_count = len(companies)
        
        for i, company in enumerate(companies, 1):
            print(f"\n진행률: {i}/{total_count} ({i/total_count*100:.1f}%)")
            
            success = self.process_delisted_company(company)
            if success:
                success_count += 1
            
            # API 호출 제한 방지를 위한 딜레이
            time.sleep(0.3)
        
        print(f"\n처리 완료: {success_count}/{total_count} 성공")
        
        # 모든 데이터를 하나의 CSV 파일로 저장
        self.save_all_data_to_csv()

def main():
    """
    메인 실행 함수
    """
    try:
        # 데이터 로더 초기화
        loader = DelistDataLoader()
        
        # 처리할 기업 수 제한 (테스트용)
        limit_input = input("처리할 기업 수를 제한하시겠습니까? (숫자 입력 또는 엔터): ").strip()
        limit = int(limit_input) if limit_input.isdigit() else None
        
        # 모든 상장 폐지 기업 처리
        loader.process_all_delisted_companies(limit)
        
    except Exception as e:
        print(f"프로그램 실행 중 오류 발생: {e}")

if __name__ == "__main__":
    main() 