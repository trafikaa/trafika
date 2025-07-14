# chatbot.py (수정 후)

from dotenv import load_dotenv
from openai import OpenAI
import os
import json

class ChatBot02:
    def __init__(self):
        load_dotenv(override=True)
        self.apikey = os.getenv("OPENAI_API_KEY")
        self.default_model = os.getenv("OPENAI_DEFAULT_MODEL")
        self.client3 = OpenAI(api_key=self.apikey)
        self.SAVE_PATH = "chat_history.json"

    def load_history(self):
        if os.path.exists(self.SAVE_PATH):
            with open(self.SAVE_PATH, "r", encoding="utf-8") as f:
                return json.load(f)
        return []

    def save_history(self, history):
        with open(self.SAVE_PATH, "w", encoding="utf-8") as f:
            json.dump(history, f, ensure_ascii=False, indent=2)
        return "✅ 대화가 저장되었습니다!"

    def response(self, message, history):
        messages = [
            {
                "role": "system",
                "content": (
                    "당신은 기업의 가치분석을 전문적으로 수행하는 AI 어시스턴트입니다. "
                    "사용자가 기업의 재무정보, 시장상황, 성장성, 리스크, 경쟁사 등 다양한 정보를 입력하면, "
                    "이를 바탕으로 기업의 내재가치, 강점과 약점, 투자 매력도 등을 분석해줍니다. "
                    "답변은 친절하고, 이해하기 쉽게 설명하며, 필요하다면 표나 예시를 활용해 주세요."
                )
            }
        ]
        messages += history
        messages.append({"role": "user", "content": message})

        result = self.client3.chat.completions.create(
            model=self.default_model,
            messages=messages,
            stream=False,
            max_tokens=100,
        )

        reply = result.choices[0].message.content

        # 응답 기록 저장
        history.append({"role": "user", "content": message})
        history.append({"role": "assistant", "content": reply})
        self.save_history(history)

        return reply, history
