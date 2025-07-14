# Trafika Chatbot

AI 챗봇 애플리케이션입니다.

## 서버(FastAPI) 활성화 방법

   - 파이썬 버전:
```
3.10.xx / 64비트트
```
   - 프로젝트 루트에 `.env` 파일을 생성하고 다음 내용을 추가:
```
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_DEFAULT_MODEL=gpt-3.5-turbo
```

1. 가상환경 활성화
   ```bash
   # 팀원 Moon 기준
   myVenv\Scripts\activate
   ```
2. 필요한 패키지 설치
   ```bash
   pip install -r requirements.txt
   ```
3. FastAPI 서버 실행
   ```bash
   uvicorn app:app --reload
   ```
   - 서버가 정상적으로 실행되면 http://localhost:8000/docs 에서 API 문서를 확인할 수 있습니다.

---

## React 앱 실행 방법

1. Node.js가 설치되어 있어야 합니다. (https://nodejs.org/)
2. React 프로젝트 폴더로 이동
   ```bash
   cd trafika-frontend
   ```
3. 필요한 패키지 설치
   ```bash
   npm install
   ```
4. React 앱 실행
   ```bash
   npm start
   ```
   - 브라우저에서 http://localhost:3000 에 접속하면 앱을 사용할 수 있습니다.



## 구조도
┌─────────────┐        ┌────────────────────┐
│   React     │  <---> │    FastAPI Backend │
│ (Next.js 등)│        └────────┬───────────┘
└─────────────┘                 │
                                ▼
      ┌────────────┬────────────┬────────────┐
      │   Ollama   │    RAG     │   A2A/MCP  │
      │ (LLM 엔진) │ (VectorDB) │ (멀티에이전트)│
      └────────────┴────────────┴────────────┘

TRAFIKA-1/
├── backend/
│   ├── app.py
│   ├── chatbot.py
│   └── .env
├── frontend/
│   └── (React 프로젝트)
├── requirements.txt
└── README.md

---

> FastAPI(백엔드)와 React(프론트엔드)는 각각 별도의 터미널에서 실행해야 합니다.
