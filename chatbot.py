from dotenv import load_dotenv
from datetime import datetime, timedelta
from openai import OpenAI
import gradio as gr
from langchain_openai import ChatOpenAI
from langchain_core.messages import AIMessage, SystemMessage, HumanMessage

import time
import json
import os

class ChatBot02:
    def __init__(self):
        load_dotenv(override=True)
        self.apikey = os.getenv("OPENAI_API_KEY")
        self.default_model = os.getenv("OPENAI_DEFAULT_MODEL")
        self.client3 = OpenAI(api_key=self.apikey)
        self.SAVE_PATH = "chat_history.json"

    # 대화 불러오기 함수
    def load_history(self):
        if os.path.exists(self.SAVE_PATH):
            with open(self.SAVE_PATH, "r", encoding="utf-8") as f:
                return json.load(f)
        return []

    # 대화 저장 함수
    def save_history(self, history):
        with open(self.SAVE_PATH, "w", encoding="utf-8") as f:
            json.dump(history, f, ensure_ascii=False, indent=2)
        return "✅ 대화가 저장되었습니다!"

    # 응답 함수
    def response(self, msg, history):
        if history is None:
            history = self.load_history()

        messages = [{"role": "system", "content": """
                        당신은 친근하고 도움이 되는 AI 어시스턴트입니다.
                        사용자와 자연스러운 대화를 나누며, 이전 대화 내용을 기억하고
                        맥락에 맞는 답변을 제공합니다.
                        한국어로 대답해주세요.
                        """}]

        # Gradio가 전달한 history를 직접 사용
        messages += history.copy()
        messages.append({"role": "user", "content": msg})

        result = self.client3.chat.completions.create(
            model=self.default_model,
            messages=messages,
            stream=True,
            max_tokens=500,
        )

        reply = ""
        for chunk in result:
            delta = chunk.choices[0].delta.content
            if delta:
                reply += delta
                time.sleep(0.1)
                # 실시간으로 답변 생성하면서 반환
                yield history + [{"role": "user", "content": msg}, 
                                {"role": "assistant", "content": reply}
                                ], ""

        # 마지막에 저장
        history.append({"role": "user", "content": msg})
        history.append({"role": "assistant", "content": reply})
        self.save_history(history)