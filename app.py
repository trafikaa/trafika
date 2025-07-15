# app.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from chatbot.ollama_chatbot import OllamaChatBot

# Ollama 챗봇 초기화 (Llama3.2 사용)
bot = OllamaChatBot(model_name="llama3.2")  # Llama3.2 모델 사용

app = FastAPI()

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # 또는 ["*"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str
    history: list  # 프론트에서 히스토리를 같이 보냄

@app.post("/chat")
def chat(request: ChatRequest):
    print("message:", request.message)
    print("history:", request.history)
    reply, updated_history = bot.response(request.message, request.history)
    return {"response": reply, "history": updated_history}

@app.get("/load")
def load():
    return {"history": bot.load_history()}

@app.get("/models")
def get_models():
    """사용 가능한 모델 목록 반환"""
    return {"models": bot.list_models()}

@app.post("/change-model/{model_name}")
def change_model(model_name: str):
    """모델 변경"""
    success = bot.change_model(model_name)
    return {"success": success, "model": model_name}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
