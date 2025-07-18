#!/usr/bin/env python3
"""
Ollama 챗봇 테스트
"""

from chatbot.ollama_chatbot import OllamaChatBot

def test_ollama_chatbot():
    """Ollama 챗봇 테스트"""
    print("🤖 Ollama 챗봇 테스트를 시작합니다...")
    
    # 챗봇 초기화 (Llama3.2 사용)
    bot = OllamaChatBot(model_name="llama3.2")
    
    # 사용 가능한 모델 확인
    print("\n📋 사용 가능한 모델:")
    models = bot.list_models()
    for model in models:
        print(f"  - {model}")
    
    # 테스트 대화
    print("\n💬 테스트 대화를 시작합니다...")
    history = []
    
    test_messages = [
        # "안녕하세요! 기업 가치 분석에 대해 궁금한 점이 있어요.",
        "삼성전자의 재무제표에 대해 분석해주세요.",
        # "감사합니다! 더 자세한 정보가 필요하면 말씀해주세요."
    ]
    
    for i, message in enumerate(test_messages, 1):
        print(f"\n👤 사용자 {i}: {message}")
        
        reply, history = bot.response(message, history)
        print(f"🤖 챗봇 {i}: {reply}")
        
    # 대화 히스토리 저장
    bot.save_history(history)
    print(f"\n💾 대화 히스토리가 저장되었습니다.")
    
    # 저장된 히스토리 로드 테스트
    loaded_history = bot.load_history()
    print(f"📂 로드된 대화 수: {len(loaded_history)}")

if __name__ == "__main__":
    test_ollama_chatbot() 