import pandas as pd

# Excel 파일 읽기
df = pd.read_excel('data/delisted_stocks_with_dart.xlsx')

# 데이터 구조 확인
print("데이터 구조:")
print(df.info())
print("\n처음 5행:")
print(df.head())

# ticker 컬럼을 6자리 숫자로 포맷팅
if 'ticker' in df.columns:
    # ticker를 문자열로 변환하고 6자리로 맞춤 (앞에 0 추가)
    df['ticker'] = df['ticker'].astype(str).str.zfill(6)
    print("\nticker 컬럼 처리 후:")
    print(df['ticker'].head())

# dart_code 컬럼을 8자리 숫자로 포맷팅
if 'dart_code' in df.columns:
    # dart_code를 문자열로 변환하고 8자리로 맞춤 (앞에 0 추가)
    df['dart_code'] = df['dart_code'].astype(str).str.zfill(8)
    print("\ndart_code 컬럼 처리 후:")
    print(df['dart_code'].head())

# '신청에 의한 상장폐지' 데이터 제외
if 'delisting_reason' in df.columns:
    print(f"\n필터링 전 데이터 개수: {len(df)}")
    df = df[(df['delisting_reason'] != '신청에 의한 상장폐지') & (df['delisting_reason'] != "포괄적 주식교환에 따른 상장폐지 신청('20.7.17)")]
    print(f"필터링 후 데이터 개수: {len(df)}")
    print("\n상장폐지 사유 분포:")
    print(df['delisting_reason'].value_counts())

# company_name을 corp_name으로 컬럼명 변경
if 'company_name' in df.columns:
    df = df.rename(columns={'company_name': 'corp_name'})
    print("\ncompany_name을 corp_name으로 변경 완료")

# company_name을 corp_name으로 컬럼명 변경
if 'dart_code' in df.columns:
    df = df.rename(columns={'dart_code': 'corp_code'})
    print("\ndart_code을 corp_name으로 변경 완료")


# ticker.1 컬럼 삭제
if 'ticker.1' in df.columns:
    df = df.drop(columns=['ticker.1'])
    print("ticker.1 컬럼 삭제 완료")

# 데이터를 두 개의 CSV 파일로 분할
# 1. 기본 정보 파일 (ticker, corp_name, corp_code, listed_company)
basic_info_columns = ['ticker', 'corp_name', 'corp_code', 'listed_company']
if all(col in df.columns for col in basic_info_columns):
    df_basic = df[basic_info_columns]
    df_basic.to_csv('data/delisted_corp_basic.csv', index=False)
    print(f"\n기본 정보 파일 생성 완료: delisted_corp_basic.csv ({len(df_basic)}행)")

# 2. 상장폐지 정보 파일 (ticker, delisting_date, delisting_reason)
delisting_info_columns = ['ticker', 'delisting_date', 'delisting_reason']
if all(col in df.columns for col in delisting_info_columns):
    df_delisting = df[delisting_info_columns]
    df_delisting.to_csv('data/delisted_corp_delisting.csv', index=False)
    print(f"상장폐지 정보 파일 생성 완료: delisted_corp_delisting.csv ({len(df_delisting)}행)")

# 원본 파일도 저장
df.to_csv('data/delisted_corp.csv', index=False)
print(f"원본 파일 저장 완료: delisted_corp.csv ({len(df)}행)")

# ticker_info_rows.csv와 delisted_corp_basic.csv 중복 ticker 확인
try:
    # ticker_info_rows.csv 파일 읽기
    ticker_info_df = pd.read_csv('data/ticker_info_rows.csv')
    print(f"\nticker_info_rows.csv 파일 읽기 완료: {len(ticker_info_df)}행")
    
    # delisted_corp_basic.csv 파일 읽기
    delisted_basic_df = pd.read_csv('data/delisted_corp_basic.csv')
    print(f"delisted_corp_basic.csv 파일 읽기 완료: {len(delisted_basic_df)}행")
    
    # ticker 컬럼명 확인 및 통일
    ticker_info_ticker_col = None
    delisted_ticker_col = None
    
    for col in ticker_info_df.columns:
        if 'ticker' in col.lower():
            ticker_info_ticker_col = col
            break
    
    for col in delisted_basic_df.columns:
        if 'ticker' in col.lower():
            delisted_ticker_col = col
            break
    
    if ticker_info_ticker_col and delisted_ticker_col:
        # 중복되는 ticker 찾기
        ticker_info_tickers = set(ticker_info_df[ticker_info_ticker_col].astype(str))
        delisted_tickers = set(delisted_basic_df[delisted_ticker_col].astype(str))
        
        # 중복 ticker
        duplicate_tickers = ticker_info_tickers.intersection(delisted_tickers)
        
        print(f"\n중복되는 ticker 개수: {len(duplicate_tickers)}")
        if len(duplicate_tickers) > 0:
            print("중복되는 ticker 목록:")
            for ticker in sorted(list(duplicate_tickers)):
                print(f"  - {ticker}")
        
        # 각 파일의 고유 ticker 개수
        ticker_info_unique = ticker_info_tickers - delisted_tickers
        delisted_unique = delisted_tickers - ticker_info_tickers
        
        print(f"\nticker_info_rows.csv에만 있는 ticker: {len(ticker_info_unique)}개")
        print(f"delisted_corp_basic.csv에만 있는 ticker: {len(delisted_unique)}개")
        
    else:
        print("ticker 컬럼을 찾을 수 없습니다.")
        print(f"ticker_info_rows.csv 컬럼: {ticker_info_df.columns.tolist()}")
        print(f"delisted_corp_basic.csv 컬럼: {delisted_basic_df.columns.tolist()}")
        
except FileNotFoundError as e:
    print(f"파일을 찾을 수 없습니다: {e}")
except Exception as e:
    print(f"오류 발생: {e}")

# 사용 가능한 컬럼명 출력
print("\n사용 가능한 컬럼명:")
print(df.head())






