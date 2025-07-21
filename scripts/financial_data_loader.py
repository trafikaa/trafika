import os
import requests
import pandas as pd
import json
from datetime import datetime
from typing import List, Dict, Any, Optional, Tuple
from dotenv import load_dotenv
import time

# .env 파일 로드
load_dotenv()

class FinancialDataLoader:
    def __init__(self):
        """
        상장 기업 재무 데이터 로더 초기화
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
        
        # 필요한 계정과목 정의
        self.target_accounts = {
            'ifrs-full_Assets': '자산총계',
            'ifrs-full_Liabilities': '부채총계',
            'ifrs-full_Equity': '자본총계',
            'ifrs-full_CurrentAssets': '유동자산',
            'ifrs-full_CurrentLiabilities': '유동부채',
            'ifrs-full_Revenue': '매출액',
            'ifrs-full_GrossProfit': '매출액',
            'ifrs-full_ProfitLoss': '당기순이익',
            'ifrs-full_CashFlowsFromUsedInOperatingActivities': '영업활동현금흐름'
        }
    
    def get_listed_companies(self) -> List[Dict[str, Any]]:
        """
        Supabase의 ticker_info 테이블에서 상장된 기업 목록 가져오기
        
        Returns:
            List[Dict[str, Any]]: 상장 기업 목록
        """
        try:
            # Supabase REST API를 사용하여 ticker_info 테이블에서 상장 기업 조회
            url = f"{self.supabase_url}/rest/v1/ticker_info"
            headers = {
                'apikey': self.supabase_key,
                'Authorization': f'Bearer {self.supabase_key}',
                'Content-Type': 'application/json'
            }
            
            # listed_company = 1인 기업들만 조회 (상장된 기업)
            params = {
                'select': 'ticker,corp_name,corp_code,listed_company',
                'listed_company': 'eq.1'
            }
            
            response = requests.get(url, headers=headers, params=params)
            response.raise_for_status()
            
            companies = response.json()
            print(f"상장 기업 {len(companies)}개 발견")
            
            return companies
            
        except Exception as e:
            print(f"상장 기업 목록 조회 중 오류 발생: {e}")
            return []
    
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
    
    def filter_target_accounts(self, financial_data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        필요한 계정과목만 필터링
        
        Args:
            financial_data (List[Dict[str, Any]]): 전체 재무제표 데이터
            
        Returns:
            List[Dict[str, Any]]: 필터링된 재무제표 데이터
        """
        filtered_data = []
        
        for item in financial_data:
            account_id = item.get('account_id', '')
            account_nm = item.get('account_nm', '').strip()
            
            # account_id 또는 account_nm이 대상 계정과목인지 확인
            is_target = False
            
            # account_id로 확인
            if account_id in self.target_accounts:
                is_target = True
            
            # account_nm으로 확인 (매출액의 경우 Revenue와 GrossProfit 둘 다 허용)
            elif account_nm in ['매출액', '매출'] and ('Revenue' in account_id or 'GrossProfit' in account_id):
                is_target = True
            
            if is_target:
                filtered_data.append(item)
        
        return filtered_data
    
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
            # 필요한 계정과목만 필터링
            filtered_data = self.filter_target_accounts(financial_data)
            
            if not filtered_data:
                print(f"⚠️ {ticker}의 대상 계정과목 데이터가 없습니다.")
                return False
            
            # 데이터 변환
            for item in filtered_data:
                # 자본변동표 데이터 제외
                statement_name = item.get('sj_nm', '')
                if '자본변동표' in statement_name:
                    continue
                
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
            
            print(f"{ticker} {year}년 데이터 수집 완료 ({len(filtered_data)}개 항목, {fs_div})")
            return True
            
        except Exception as e:
            print(f"데이터 수집 중 오류 발생: {e}")
            return False
    
    def save_all_data_to_csv(self, year: str):
        """
        수집된 모든 데이터를 연도별 CSV 파일로 저장
        
        Args:
            year (str): 연도
        """
        try:
            if not self.all_csv_data:
                print("저장할 데이터가 없습니다.")
                return
            
            # CSV 파일명 생성 (연도별)
            csv_filename = f"data/listed_financials_{year}.csv"
            
            # data 폴더가 없으면 생성
            os.makedirs("data", exist_ok=True)
            
            # DataFrame으로 변환하여 CSV 저장
            df = pd.DataFrame(self.all_csv_data)
            df.to_csv(csv_filename, index=False, encoding='utf-8-sig')
            
            print(f"{year}년 데이터 CSV 저장 완료 ({len(self.all_csv_data)}개 항목)")
            print(f"파일 위치: {csv_filename}")
            
        except Exception as e:
            print(f"CSV 저장 중 오류 발생: {e}")
    
    def process_listed_company(self, company: Dict[str, Any], year: str = "2024") -> bool:
        """
        상장 기업 데이터 처리
        
        Args:
            company (Dict[str, Any]): 기업 정보
            year (str): 연도
            
        Returns:
            bool: 처리 성공 여부
        """
        ticker = company.get('ticker')
        corp_code = company.get('corp_code')
        company_name = company.get('corp_name')
        
        print(f"\n처리 중: {company_name} ({ticker}) - {year}년")
        
        if not corp_code:
            print(f"기업 코드가 없습니다: {ticker}")
            return False
        
        # 재무제표 데이터 조회 (우선순위 적용)
        financial_data, fs_div = self.get_financial_data_with_priority(corp_code, year)
        
        if not financial_data:
            print(f"재무제표 데이터가 없습니다: {ticker}")
            return False
        
        # CSV 데이터 수집
        success = self.collect_financial_data_for_csv(ticker, year, financial_data, fs_div)
        
        if success:
            print(f"✅ {company_name} ({ticker}) 데이터 처리 완료")
        else:
            print(f"❌ {company_name} ({ticker}) 데이터 처리 실패")
        
        return success
    
    def process_all_listed_companies(self, year: str = "2024", limit: Optional[int] = None):
        """
        모든 상장 기업 데이터 처리
        
        Args:
            year (str): 연도
            limit (Optional[int]): 처리할 기업 수 제한 (테스트용)
        """
        print(f"상장 기업 재무 데이터 수집 시작 ({year}년)")
        print("대상 계정과목: 자산총계, 부채총계, 자본총계, 유동자산, 유동부채, 매출액, 당기순이익, 영업활동현금흐름")
        
        # 상장 기업 목록 가져오기
        companies = self.get_listed_companies()
        
        if not companies:
            print("상장 기업이 없습니다.")
            return
        
        if limit:
            companies = companies[:limit]
            print(f"테스트 모드: {limit}개 기업만 처리")
        
        success_count = 0
        total_count = len(companies)
        
        for i, company in enumerate(companies, 1):
            print(f"\n진행률: {i}/{total_count} ({i/total_count*100:.1f}%)")
            
            success = self.process_listed_company(company, year)
            if success:
                success_count += 1
            
            # API 호출 제한 방지를 위한 딜레이
            time.sleep(0.3)
        
        print(f"\n처리 완료: {success_count}/{total_count} 성공")
        
        # 연도별 CSV 파일로 저장
        self.save_all_data_to_csv(year)

def main():
    """
    메인 실행 함수
    """
    try:
        # 데이터 로더 초기화
        loader = FinancialDataLoader()
        
        # 처리할 연도들
        years = ["2022", "2023", "2024"]
        
        # 처리할 기업 수 제한 (테스트용)
        limit_input = input("처리할 기업 수를 제한하시겠습니까? (숫자 입력 또는 엔터): ").strip()
        limit = int(limit_input) if limit_input.isdigit() else None
        
        # 각 연도별로 처리
        for year in years:
            print(f"\n{'='*50}")
            print(f"{year}년 데이터 처리 시작")
            print(f"{'='*50}")
            
            # CSV 데이터 초기화 (연도별로 새로 시작)
            loader.all_csv_data = []
            
            # 해당 연도의 상장 기업 처리
            loader.process_all_listed_companies(year, limit)
            
            print(f"\n{year}년 처리 완료")
        
        print(f"\n{'='*50}")
        print("모든 연도 처리 완료!")
        print(f"{'='*50}")
        
    except Exception as e:
        print(f"프로그램 실행 중 오류 발생: {e}")

if __name__ == "__main__":
    main() 
