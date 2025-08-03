# Trafika - 재무제표 분석 AI

기업의 재무 데이터를 분석하여 건전성을 평가하고 AI 챗봇을 통해 인사이트를 제공하는 웹 애플리케이션입니다.

## 주요 기능

- **기업 검색**: 기업명으로 기업 정보 및 재무 데이터 검색
- **재무비율 분석**: 부채비율, 유동비율, ROE 등 6가지 핵심 재무비율 분석
- **AI 챗봇**: ChatGPT API를 활용한 재무 분석 결과 해석 및 권장사항 제공
- **위험도 평가**: 재무건전성 점수 및 위험도 레벨 산출
- **개선 권장사항**: 재무건전성 개선을 위한 구체적인 권장사항 제공

## 기술 스택

### Frontend
- **React 18** - 사용자 인터페이스
- **TypeScript** - 타입 안전성
- **Vite** - 빌드 도구
- **Tailwind CSS** - 스타일링

### Backend & Database
- **Supabase** - 데이터베이스 및 인증
- **Netlify Functions** - 서버리스 API
- **OpenAI API** - AI 챗봇 기능

### 주요 라이브러리
- **@supabase/supabase-js** - Supabase 클라이언트
- **axios** - HTTP 클라이언트
- **lucide-react** - 아이콘 라이브러리

## 설치 및 실행

### 1. 저장소 클론
```bash
git clone [repository-url]
cd trafika
```

### 2. 의존성 설치
```bash
npm install
```

### 3. 환경변수 설정
프로젝트 루트에 `.env` 파일을 생성하고 다음 변수들을 설정하세요:

```env
VITE_SUPABASE_DATABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_key
OPENAI_API_KEY=your_openai_api_key
```

### 4. Google Tag Manager 설정
GTM을 사용하여 방문자 분석을 하려면:

1. [Google Tag Manager](https://tagmanager.google.com/)에서 새 계정 생성
2. 컨테이너 생성 → 웹 컨테이너 선택
3. GTM 컨테이너 ID (GTM-XXXXXXX) 복사
4. `index.html`의 GTM ID를 실제 컨테이너 ID로 교체

#### 현재 설정된 GTM ID:
- **GTM-P83P385B** (이미 설정됨)

#### GTM에서 설정할 태그들:
1. **Google Analytics 4** 태그 추가
2. **사용자 정의 이벤트** 태그 추가 (챗봇, 재무분석 등)
3. **트리거** 설정 (페이지 뷰, 클릭 등)

**추적되는 이벤트들:**
- 페이지 방문 및 체류 시간
- 챗봇 대화 시작/완료/중단
- 기업 검색 및 재무 분석
- 사용자 세그먼트 (신규/재방문/충성 사용자)
- 전환 목표 달성률

### 5. 개발 서버 실행
```bash
# 일반 개발 서버
npm run dev

# Netlify 개발 서버 (서버리스 함수 포함)
npx netlify dev
```

### 6. 빌드
```bash
npm run build
```

## 재무비율 분석 항목

| 비율 | 설명 | 우수 기준 | 양호 기준 |
|------|------|-----------|-----------|
| 부채비율 | 총부채 / 자기자본 | 100% 이하 | 200% 이하 |
| 유동비율 | 유동자산 / 유동부채 | 150% 이상 | 100% 이상 |
| 자기자본비율 | 자기자본 / 총자산 | 50% 이상 | 30% 이상 |
| 매출액 성장률 | 전년 대비 매출액 증가율 | 10% 이상 | 0% 이상 |
| ROE | 순이익 / 자기자본 | 10% 이상 | 5% 이상 |
| 영업이익률 | 영업이익 / 총자산 | 10% 이상 | 5% 이상 |

## 프로젝트 구조

```
trafika/
├── src/
│   ├── components/          # React 컴포넌트
│   │   ├── FinancialHealthReport.tsx  # 재무건전성 보고서
│   │   ├── EnhancedChatMessage.tsx    # 채팅 메시지
│   │   └── ...
│   ├── services/           # API 서비스
│   │   ├── companyService.ts    # 기업 데이터 서비스
│   │   ├── chatgptApi.ts       # ChatGPT API
│   │   └── ...
│   ├── hooks/             # React 훅
│   ├── utils/             # 유틸리티 함수
│   └── types/             # TypeScript 타입 정의
├── netlify/functions/     # 서버리스 함수
├── data/                  # 데이터 파일
└── scripts/               # Python 스크립트
```

## 주요 컴포넌트

### FinancialHealthReport
재무건전성 분석 결과를 시각화하는 핵심 컴포넌트입니다.
- 재무비율 표시 및 건강도 평가
- 위험도 점수 계산
- 개선 권장사항 제공

### EnhancedChatMessage
재무비율이 포함된 구조화된 채팅 메시지를 표시하는 컴포넌트입니다.
- 재무 데이터 시각화
- 사용자 친화적 인터페이스

### ChatMessage
기본 텍스트 채팅 메시지를 표시하는 컴포넌트입니다.
- 일반 대화 메시지 처리
- 간단한 텍스트 표시

## AI 챗봇 기능

ChatGPT API를 활용하여 다음과 같은 기능을 제공합니다:
- 재무 분석 결과 해석
- 위험 요소 분석
- 구체적인 개선 방안 제시
- 자연어 질의응답

## 위험도 평가 시스템

재무비율을 종합적으로 분석하여 위험도를 평가합니다:

### 위험 요소 우선순위
1. **영업현금흐름** (음수 시 가장 위험)
2. **부채비율** (200% 초과 시 위험)
3. **유동비율** (100% 미만 시 위험)
4. **매출액 성장률** (음수 시 위험)
5. **영업이익률** (5% 미만 시 위험)
6. **자기자본비율** (30% 미만 시 위험)
7. **ROE** (5% 미만 시 위험)

### 위험도 레벨
- **안전** (0-39점): 양호한 재무상태
- **주의** (40-69점): 개선이 필요한 상태
- **위험** (70점 이상): 즉시 개선이 필요한 상태

### UI/UX 기획
- https://www.figma.com/design/wJRN7w31hgDhTyJJcIewqz/ChatBot-smart--Community---Copy-?node-id=0-1&t=WN1TRkBRQSvEYUTA-1

## 환경변수 설정

### Netlify 배포 시
Netlify 대시보드에서 다음 환경변수를 설정하세요:
- `VITE_SUPABASE_DATABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY`

### 로컬 개발 시
`.env` 파일을 생성하여 동일한 변수들을 설정하세요.

## 사용법

1. **기업 검색**: 검색창에 기업명을 입력하세요
2. **재무 분석**: 자동으로 재무비율이 계산되고 분석됩니다
3. **AI 질문**: 챗봇과 대화하여 재무 분석 결과에 대해 질문하세요
4. **권장사항 확인**: 재무건전성 개선을 위한 구체적인 방안을 확인하세요

