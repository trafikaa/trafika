#!/usr/bin/env python3
"""
Ollama 챗봇 설정 관리
"""

import json
import os
from typing import Dict, Any

class OllamaConfig:
    def __init__(self, config_file: str = "ollama_config.json"):
        self.config_file = config_file
        self.default_config = {
            "model_name": "llama2",
            "base_url": "http://localhost:11434",
            "temperature": 0.7,
            "top_p": 0.9,
            "max_tokens": 1000,
            "system_prompt": (
                "당신은 기업의 가치분석을 전문적으로 수행하는 AI 어시스턴트입니다. "
                "사용자가 기업의 재무정보, 시장상황, 성장성, 리스크, 경쟁사 등 다양한 정보를 입력하면, "
                "이를 바탕으로 기업의 내재가치, 강점과 약점, 투자 매력도 등을 분석해줍니다. "
                "답변은 친절하고, 이해하기 쉽게 설명하며, 필요하다면 표나 예시를 활용해 주세요."
            ),
            "available_models": [
                "llama2",
                "llama2:7b",
                "llama2:13b",
                "codellama",
                "mistral",
                "llama2:7b-chat",
                "llama2:13b-chat"
            ]
        }
        self.config = self.load_config()
    
    def load_config(self) -> Dict[str, Any]:
        """설정 파일 로드"""
        if os.path.exists(self.config_file):
            try:
                with open(self.config_file, "r", encoding="utf-8") as f:
                    return json.load(f)
            except Exception as e:
                print(f"설정 파일 로드 실패: {e}")
                return self.default_config
        else:
            # 기본 설정으로 파일 생성
            self.save_config(self.default_config)
            return self.default_config
    
    def save_config(self, config: Dict[str, Any]) -> bool:
        """설정 파일 저장"""
        try:
            with open(self.config_file, "w", encoding="utf-8") as f:
                json.dump(config, f, ensure_ascii=False, indent=2)
            return True
        except Exception as e:
            print(f"설정 파일 저장 실패: {e}")
            return False
    
    def get(self, key: str, default=None):
        """설정 값 가져오기"""
        return self.config.get(key, default)
    
    def set(self, key: str, value: Any) -> bool:
        """설정 값 설정"""
        self.config[key] = value
        return self.save_config(self.config)
    
    def update_model(self, model_name: str) -> bool:
        """모델 변경"""
        if model_name in self.config.get("available_models", []):
            return self.set("model_name", model_name)
        else:
            print(f"❌ 모델 {model_name}이 사용 가능한 모델 목록에 없습니다.")
            return False
    
    def get_model_info(self) -> Dict[str, Any]:
        """현재 모델 정보 반환"""
        return {
            "current_model": self.get("model_name"),
            "base_url": self.get("base_url"),
            "temperature": self.get("temperature"),
            "max_tokens": self.get("max_tokens"),
            "available_models": self.get("available_models", [])
        }
    
    def reset_to_default(self) -> bool:
        """기본 설정으로 초기화"""
        return self.save_config(self.default_config)

def main():
    """설정 관리 도구"""
    config = OllamaConfig()
    
    print("🤖 Ollama 챗봇 설정 관리")
    print("=" * 40)
    
    while True:
        print("\n1. 현재 설정 보기")
        print("2. 모델 변경")
        print("3. 기본 설정으로 초기화")
        print("4. 종료")
        
        choice = input("\n선택하세요 (1-4): ").strip()
        
        if choice == "1":
            info = config.get_model_info()
            print(f"\n📋 현재 설정:")
            print(f"  모델: {info['current_model']}")
            print(f"  서버: {info['base_url']}")
            print(f"  Temperature: {info['temperature']}")
            print(f"  Max Tokens: {info['max_tokens']}")
            print(f"  사용 가능한 모델: {', '.join(info['available_models'])}")
        
        elif choice == "2":
            print(f"\n사용 가능한 모델: {', '.join(config.get('available_models', []))}")
            model = input("변경할 모델명을 입력하세요: ").strip()
            if config.update_model(model):
                print(f"✅ 모델이 {model}로 변경되었습니다.")
            else:
                print("❌ 모델 변경에 실패했습니다.")
        
        elif choice == "3":
            if config.reset_to_default():
                print("✅ 기본 설정으로 초기화되었습니다.")
            else:
                print("❌ 초기화에 실패했습니다.")
        
        elif choice == "4":
            print("👋 설정 관리를 종료합니다.")
            break
        
        else:
            print("❌ 잘못된 선택입니다. 1-4 중에서 선택해주세요.")

if __name__ == "__main__":
    main() 