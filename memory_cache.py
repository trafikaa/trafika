import time
import socket
import gradio as gr
from dotenv import load_dotenv
import os

from redis import Redis
from langchain_core.globals import set_llm_cache
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage
from langchain_community.cache import RedisCache
from langchain_core.caches import InMemoryCache as CoreInMemoryCache
from langchain_openai import ChatOpenAI

# ✅ .env 파일 로드
load_dotenv(override=True)

# ✅ 환경 변수 설정
OPENAI_API_KEY = os.getenv("API2")
MODEL_NAME = os.getenv("OPENAI_DEFAULT_MODEL")
REDIS_HOST = os.getenv("REDIS_HOST")
REDIS_PASSWORD = os.getenv("REDIS_PWD")
REDIS_PORT = int(os.getenv("REDIS_PORT"))

class InvestmentChatBot:
    """
    투자 교육 전문가 역할을 수행하는 LangChain 기반 챗봇
    Redis 캐시를 통해 LLM 응답 속도 향상
    """

    def __init__(self):
        self.system_prompt = """당신은 투자 교육 전문가입니다.
        사용자와 자연스러운 대화를 나누며, 다음과 같은 방식으로 투자 교육을 제공합니다:
        1. 개념 설명 → 2. 상호작용 퀴즈 → 3. 피드백 제공
        이전 대화 내용을 기억하고 맥락에 맞는 답변을 제공합니다. 한국어로 대답해주세요."""

        self._init_cache()

        # LangChain 기반 OpenAI LLM 초기화
        self.llm = ChatOpenAI(
            model=MODEL_NAME,
            temperature=0.3,
            streaming=True,
            api_key=OPENAI_API_KEY
        )

    def _init_cache(self):
        """
        Redis 캐시 연결 시도, 실패 시 인메모리 캐시로 대체
        """
        try:
            if REDIS_HOST and REDIS_PASSWORD:
                redis_client = Redis(
                    host=REDIS_HOST,
                    port= 17159,
                    password=REDIS_PASSWORD,
                    decode_responses=True
                )
                redis_client.ping()
                set_llm_cache(RedisCache(redis_client))
            else:
                # set_llm_cache(CoreInMemoryCache())
                print("Redis 연결 실패: 인메모리 캐시로 전환해주세요.")
        except:
            # set_llm_cache(CoreInMemoryCache())
            print("Redis 연결 실패: 인메모리 캐시로 전환해주세요.")

    def _convert_to_langchain_messages(self, gradio_history):
        """
        Gradio history → LangChain 메시지 형식으로 변환
        """
        messages = [SystemMessage(content=self.system_prompt)]
        for user_msg, bot_msg in gradio_history:
            if user_msg:
                messages.append(HumanMessage(content=user_msg))
            if bot_msg:
                messages.append(AIMessage(content=bot_msg))
        return messages

    def stream_response(self, user_input: str, gradio_history: list):
        """
        LangChain의 Streaming API를 사용한 실시간 응답 생성
        """
        messages = self._convert_to_langchain_messages(gradio_history)
        messages.append(HumanMessage(content=user_input))

        collected = []
        for chunk in self.llm.stream(messages):
            if chunk.content:
                collected.append(chunk.content)
                yield ''.join(collected)
                time.sleep(0.02)

    def get_history_length(self, gradio_history):
        """
        현재 대화 내역 길이 반환
        """
        return len(gradio_history)


# ✅ Gradio 인터페이스 구성
def create_interface():
    bot = InvestmentChatBot()

    with gr.Blocks(theme=gr.themes.Soft()) as demo:
        gr.Markdown("# 📊 투자 학습 챗봇")
        gr.Markdown("투자 관련 질문을 입력하면 챗봇이 친절하게 교육해 드립니다.")

        with gr.Row():
            with gr.Column(scale=4):
                chatbot = gr.Chatbot(
                    label="대화 내용",
                    height=500,
                    bubble_full_width=False
                )
            with gr.Column(scale=1):
                status = gr.Textbox(label="상태", value="대화 기록: 0개", interactive=False)

        user_input = gr.Textbox(
            label="메시지 입력",
            placeholder="예: 'ETF가 뭐예요?'",
            lines=2
        )

        with gr.Row():
            submit_btn = gr.Button("전송", variant="primary")
            clear_btn = gr.Button("초기화", variant="secondary")

        def respond(message, history):
            if not message.strip():
                return history, "", f"대화 기록: {bot.get_history_length(history)}개"
            history = history + [(message, "")]
            full_response = ""
            for chunk in bot.stream_response(message, history[:-1]):
                full_response = chunk
                history[-1] = (message, full_response)
                yield history, "", f"대화 기록: {bot.get_history_length(history)}개"

        def clear_chat():
            return [], "", "대화 기록: 0개"

        user_input.submit(respond, [user_input, chatbot], [chatbot, user_input, status])
        submit_btn.click(respond, [user_input, chatbot], [chatbot, user_input, status])
        clear_btn.click(clear_chat, outputs=[chatbot, user_input, status])

    return demo


# ✅ 실행부
if __name__ == "__main__":
    if not OPENAI_API_KEY:
        raise EnvironmentError("OpenAI API 키가 설정되어 있지 않습니다. .env 파일을 확인하세요.")

    demo = create_interface()

    # 사용 가능한 포트 자동 할당
    def find_free_port():
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            s.bind(('', 0))
            return s.getsockname()[1]

    demo.launch(
        server_name="127.0.0.1",
        server_port=find_free_port(),
        share=True,
        show_error=True
    )