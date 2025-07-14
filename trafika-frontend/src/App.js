// frontend/src/App.js

import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState([]); // API에서 사용할 히스토리
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    setLoading(true);
    try {
      const response = await axios.post('http://localhost:8000/chat', {
        message: input,
        history: history,
      });

      const reply = response.data.response;
      const updatedHistory = response.data.history;

      setHistory(updatedHistory);
      setInput('');
    } catch (err) {
      alert('API 오류 발생: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // 저장 버튼 클릭 시
  const handleSave = async () => {
    const res = await fetch("http://localhost:8000/save");
    const data = await res.json();
    alert(data.message || "저장 완료!");
  };

  // 불러오기 버튼 클릭 시
  const handleLoad = async () => {
    const res = await fetch("http://localhost:8000/load");
    const data = await res.json();
    setHistory(data.history || []);
  };

  // 대화삭제 버튼 클릭 시
  const handleClear = () => {
    setHistory([]);
  };

  return (
    <div className="App">
      <h1>TRAFIKA 챗봇</h1>
      <div className="chatbox">
        {history.map((msg, index) => (
          <div
            key={index}
            className={msg.role === 'user' ? 'user' : 'bot'}
          >
            <b>{msg.role === 'user' ? '🙋‍♂️ 나' : '🤖 봇'}</b>: {msg.content}
          </div>
        ))}
      </div>
      <div className="input-area">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="메시지를 입력하세요"
        />
        <button onClick={sendMessage} disabled={loading}>
          {loading ? '응답 중...' : '전송'}
        </button>
        <button onClick={handleSave}>저장</button>
        <button onClick={handleLoad}>불러오기</button>
        <button onClick={handleClear}>대화삭제</button>
      </div>
    </div>
  );
}

export default App;
