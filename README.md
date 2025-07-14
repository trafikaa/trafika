# Trafika Chatbot

AI 챗봇 애플리케이션입니다.

## 설정 방법

1. 가상환경 활성화:
```bash
venv\Scripts\activate
```

2. 라이브러리 설치:
```bash
pip install -r requirements.txt
```

3. 환경 변수 설정:
   - 프로젝트 루트에 `.env` 파일을 생성하고 다음 내용을 추가:
```
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_DEFAULT_MODEL=gpt-3.5-turbo
```

4. 앱 실행:
```bash
python app.py
```

## 접속 URL
- 로컬: http://127.0.0.1:7860
- 공개: https://[gradio-generated-url].gradio.live
