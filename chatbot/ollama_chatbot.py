import requests
import json
import os
from typing import List, Dict, Tuple

class OllamaChatBot:
    def __init__(self, model_name: str = "llama2", base_url: str = "http://localhost:11434"):
        """
        Ollama 챗봇 초기화
        
        Args:
            model_name: 사용할 Ollama 모델 이름 (기본값: llama2)
            base_url: Ollama 서버 URL (기본값: http://localhost:11434)
        """
        self.model_name = model_name
        self.base_url = base_url
        self.SAVE_PATH = "chat_history.json"
        
        # Ollama 서버 연결 확인
        self._check_ollama_connection()
    
    def _check_ollama_connection(self):
        """Ollama 서버 연결 상태 확인"""
        try:
            response = requests.get(f"{self.base_url}/api/tags", timeout=10)
            if response.status_code == 200:
                print(f"✅ Ollama 서버에 연결되었습니다. 사용 가능한 모델: {response.json()}")
            else:
                print("⚠️ Ollama 서버에 연결할 수 없습니다.")
        except Exception as e:
            print(f"❌ Ollama 서버 연결 실패: {e}")
            print("Ollama가 설치되어 있고 실행 중인지 확인해주세요.")
    
    def load_history(self) -> List[Dict]:
        """대화 히스토리 로드"""
        if os.path.exists(self.SAVE_PATH):
            try:
                with open(self.SAVE_PATH, "r", encoding="utf-8") as f:
                    return json.load(f)
            except Exception as e:
                print(f"히스토리 로드 실패: {e}")
                return []
        return []
    
    def save_history(self, history: List[Dict]) -> str:
        """대화 히스토리 저장"""
        try:
            with open(self.SAVE_PATH, "w", encoding="utf-8") as f:
                json.dump(history, f, ensure_ascii=False, indent=2)
            return "✅ 대화가 저장되었습니다!"
        except Exception as e:
            return f"❌ 저장 실패: {e}"
    
    def response(self, message: str, history: List[Dict]) -> Tuple[str, List[Dict]]:
        """
        Ollama를 사용하여 응답 생성
        
        Args:
            message: 사용자 메시지
            history: 대화 히스토리
            
        Returns:
            (응답, 업데이트된 히스토리)
        """
        try:
            # 시스템 프롬프트 설정
            system_prompt = (
                "당신은 기업의 가치분석을 전문적으로 수행하는 AI 어시스턴트입니다. "
                "사용자가 기업의 재무정보, 시장상황, 성장성, 리스크, 경쟁사 등 다양한 정보를 입력하면, "
                "이를 바탕으로 기업의 내재가치, 강점과 약점, 투자 매력도 등을 분석해줍니다. "
                "답변은 친절하고, 이해하기 쉽게 설명하며, 필요하다면 표나 예시를 활용해 주세요."
            )
            
            # 메시지 형식 구성
            messages = [
                {"role": "system", "content": system_prompt}
            ]
            
            # 히스토리 추가
            messages.extend(history)
            
            # 현재 사용자 메시지 추가
            messages.append({"role": "user", "content": message})
            
            # Ollama API 호출 (타임아웃 120초로 증가)
            response = requests.post(
                f"{self.base_url}/api/chat",
                json={
                    "model": self.model_name,
                    "messages": messages,
                    "stream": False,
                    "options": {
                        "temperature": 0.7,
                        "top_p": 0.9,
                        "max_tokens": 1000
                    }
                },
                timeout=120  # 타임아웃을 120초로 증가
            )
            
            if response.status_code == 200:
                result = response.json()
                reply = result["message"]["content"]
                
                # 응답 기록 저장
                history.append({"role": "user", "content": message})
                history.append({"role": "assistant", "content": reply})
                self.save_history(history)
                
                return reply, history
            else:
                error_msg = f"Ollama API 오류: {response.status_code} - {response.text}"
                print(error_msg)
                return error_msg, history
                
        except requests.exceptions.RequestException as e:
            error_msg = f"네트워크 오류: {e}"
            print(error_msg)
            return error_msg, history
        except Exception as e:
            error_msg = f"예상치 못한 오류: {e}"
            print(error_msg)
            return error_msg, history
    
    def list_models(self) -> List[str]:
        """사용 가능한 모델 목록 조회"""
        try:
            response = requests.get(f"{self.base_url}/api/tags", timeout=10)
            if response.status_code == 200:
                models = response.json().get("models", [])
                return [model["name"] for model in models]
            return []
        except Exception as e:
            print(f"모델 목록 조회 실패: {e}")
            return []
    
    def change_model(self, new_model: str) -> bool:
        """모델 변경"""
        available_models = self.list_models()
        if new_model in available_models:
            self.model_name = new_model
            print(f"✅ 모델이 {new_model}로 변경되었습니다.")
            return True
        else:
            print(f"❌ 모델 {new_model}을 찾을 수 없습니다. 사용 가능한 모델: {available_models}")
            return False 