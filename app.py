# app.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from chatbot import ChatBot02

bot = ChatBot02()

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

@app.get("/save")
def save():
    history = bot.load_history()
    status = bot.save_history(history)
    return {"message": status}
