#!/usr/bin/env python3
"""
간단한 Ollama 연결 테스트
"""

import requests
import json

def test_ollama_connection():
    """Ollama 서버 연결 테스트"""
    print("🔍 Ollama 서버 연결 테스트 중...")
    
    try:
        # 서버 상태 확인
        response = requests.get("http://localhost:11434/api/tags", timeout=10)
        if response.status_code == 200:
            models = response.json().get("models", [])
            print(f"✅ 서버 연결 성공! 사용 가능한 모델: {[m['name'] for m in models]}")
            
            if models:
                # 간단한 테스트 메시지 (Llama3.2 사용)
                test_message = {
                    "model": "llama3.2",
                    "messages": [
                        {"role": "user", "content": "안녕하세요! 간단한 테스트입니다."}
                    ],
                    "stream": False
                }
                
                print("🤖 첫 번째 응답을 기다리는 중... (모델 로딩 시간이 필요할 수 있습니다)")
                
                response = requests.post(
                    "http://localhost:11434/api/chat",
                    json=test_message,
                    timeout=120  # 2분 타임아웃
                )
                
                if response.status_code == 200:
                    result = response.json()
                    reply = result.get("message", {}).get("content", "응답 없음")
                    print(f"✅ 테스트 성공! 응답: {reply[:100]}...")
                    return True
                else:
                    print(f"❌ API 호출 실패: {response.status_code}")
                    return False
            else:
                print("❌ 사용 가능한 모델이 없습니다.")
                return False
        else:
            print(f"❌ 서버 연결 실패: {response.status_code}")
            return False
            
    except requests.exceptions.Timeout:
        print("❌ 타임아웃: 서버 응답이 너무 느립니다.")
        return False
    except requests.exceptions.ConnectionError:
        print("❌ 연결 오류: Ollama 서버가 실행 중인지 확인하세요.")
        return False
    except Exception as e:
        print(f"❌ 오류 발생: {e}")
        return False

if __name__ == "__main__":
    success = test_ollama_connection()
    if success:
        print("\n🎉 모든 테스트가 성공했습니다!")
    else:
        print("\n💥 테스트에 실패했습니다.") 