# Trafika Chatbot

AI 챗봇 애플리케이션입니다. OpenAI API와 Ollama를 모두 지원합니다.

## 🚀 빠른 시작 (Ollama 사용)

### 1. Ollama 설치

**Windows:**
```bash
# https://ollama.ai 에서 다운로드 후 설치
# 또는 winget 사용
winget install Ollama.Ollama
```

**macOS:**
```bash
# https://ollama.ai 에서 다운로드 후 설치
# 또는 Homebrew 사용
brew install ollama
```

**Linux:**
```bash
curl -fsSL https://ollama.ai/install.sh | sh
```

### 2. Ollama 모델 다운로드

```bash
# 기본 모델 다운로드
ollama pull llama2

# 또는 다른 모델들
ollama pull llama2:7b
ollama pull llama2:13b
ollama pull codellama
ollama pull mistral
```

### 3. 서버 실행

1. 가상환경 활성화
   ```bash
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

4. 챗봇 테스트
   ```bash
   python test_ollama.py
   ```

---

## 🔧 기존 OpenAI API 사용

### 환경 설정

프로젝트 루트에 `.env` 파일을 생성하고 다음 내용을 추가:
```
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_DEFAULT_MODEL=gpt-3.5-turbo
```

### 서버 실행

1. 가상환경 활성화
   ```bash
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

서버가 정상적으로 실행되면 http://localhost:8000/docs 에서 API 문서를 확인할 수 있습니다.

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

---

## 📋 API 엔드포인트

### Ollama 챗봇 API

- `POST /chat` - 챗봇과 대화
- `GET /load` - 대화 히스토리 로드
- `GET /save` - 대화 히스토리 저장
- `GET /models` - 사용 가능한 Ollama 모델 목록
- `POST /change-model/{model_name}` - 모델 변경

### 사용 예시

```bash
# 모델 목록 조회
curl http://localhost:8000/models

# 모델 변경
curl -X POST http://localhost:8000/change-model/llama2:7b

# 챗봇과 대화
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "안녕하세요!", "history": []}'
```

---

## 🛠️ 문제 해결

### Ollama 연결 문제

1. Ollama가 실행 중인지 확인:
   ```bash
   ollama list
   ```

2. 서버 상태 확인:
   ```bash
   curl http://localhost:11434/api/tags
   ```

3. 모델이 다운로드되었는지 확인:
   ```bash
   ollama list
   ```

### 일반적인 문제들

- **포트 충돌**: 8000번 포트가 사용 중인 경우 다른 포트 사용
  ```bash
  uvicorn app:app --reload --port 8001
  ```

- **모델 다운로드 실패**: 네트워크 연결 확인 후 재시도
  ```bash
  ollama pull llama2
  ```

---

<details> <summary><b>📌 아키텍처 구조도 (FastAPI + React + Ollama/RAG/A2A)</b></summary>
┌─────────────┐        ┌────────────────────┐
│   React     │ <----> │   FastAPI Backend  │
│ (Next.js 등)│        └────────┬───────────┘
└─────────────┘                 │
                                ▼
      ┌────────────┬────────────┬────────────┐
      │   Ollama   │    RAG     │   A2A/MCP  │
      │ (LLM 엔진) │ (VectorDB) │ (멀티에이전트)│
      └────────────┴────────────┴────────────┘
</details>

<details> <summary><b>📁 디렉토리 구조 (TRAFIKA 프로젝트)</b></summary>
TRAFIKA-1/
├── app.py                 # FastAPI 진입점
├── chatbot.py             # OpenAI 챗봇 (기존)
├── chatbot/
│   └── ollama_chatbot.py # Ollama 챗봇 (새로 추가)
├── test_ollama.py        # Ollama 테스트 스크립트
├── trafika-frontend/     # React 프론트엔드
│   ├── src/
│   │   ├── App.js
│   │   └── App.css
│   └── package.json
├── requirements.txt       # Python 의존성
└── README.md
</details>

> FastAPI(백엔드)와 React(프론트엔드)는 각각 별도의 터미널에서 실행해야 합니다.
