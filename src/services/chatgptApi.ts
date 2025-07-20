interface ChatGPTOptions {
  model?: string;
  max_tokens?: number;
  temperature?: number;
}

interface ChatGPTMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ChatGPTResponse {
  response?: string;
  error?: string;
  details?: string;
}

class ChatGPTApi {
  private baseUrl: string = '/.netlify/functions/chatgptProxy';

  async chat(
    messages: ChatGPTMessage[],
    options: ChatGPTOptions = {}
  ): Promise<string> {
    const defaultOptions: ChatGPTOptions = {
      model: 'gpt-3.5-turbo',
      max_tokens: 1000,
      temperature: 0.7,
      ...options,
    };

    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages,
          options: defaultOptions,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP 오류: ${response.status}`);
      }

      const data: ChatGPTResponse = await response.json();
      
      if (data.error) {
        throw new Error(`ChatGPT API 오류: ${data.error}${data.details ? ` - ${data.details}` : ''}`);
      }

      return data.response || '응답을 생성할 수 없습니다.';
    } catch (error) {
      console.error('ChatGPT API 호출 오류:', error);
      throw error;
    }
  }

  // 재무 분석에 특화된 시스템 프롬프트
  getFinancialAnalysisPrompt(): string {
    return `당신은 한국 기업의 재무제표 분석 전문가입니다. 
    
다음 규칙을 따라 답변해주세요:

1. 한국어로 답변하세요
2. 재무제표 관련 질문에 대해 전문적이고 정확한 답변을 제공하세요
3. 복잡한 재무 개념을 쉽게 설명하세요
4. 기업명, 재무비율, 재무상태 등에 대한 질문에 구체적으로 답변하세요
5. 투자 조언은 제공하지 말고, 객관적인 정보만 제공하세요
6. 모르는 내용에 대해서는 솔직히 모른다고 답변하세요

사용자의 질문에 친근하고 전문적으로 답변해주세요.`;
  }

  // 일반적인 대화를 위한 시스템 프롬프트
  getGeneralChatPrompt(): string {
    return `당신은 친근하고 도움이 되는 AI 어시스턴트입니다. 
    
다음 규칙을 따라 답변해주세요:

1. 한국어로 답변하세요
2. 친근하고 도움이 되는 톤으로 답변하세요
3. 사용자의 질문에 정확하고 유용한 정보를 제공하세요
4. 모르는 내용에 대해서는 솔직히 모른다고 답변하세요
5. 너무 긴 답변은 피하고, 핵심적인 내용을 간결하게 전달하세요

사용자와 자연스럽게 대화해주세요.`;
  }
}

export const chatgptApi = new ChatGPTApi(); 