// frontend/src/App.js

import React, { useState } from "react";
import Chatbot from "./Chatbot";

function App() {
  const [showChat, setShowChat] = useState(false);

  if (!showChat) {
    // 시작화면
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-pink-100">
        <div className="flex flex-col items-center">
          {/* 로고 */}
          <div className="mb-6">
            <img src="/logo.png" alt="Rak-GPT" className="w-20 h-20" />
          </div>
          {/* 앱명 */}
          <h1 className="text-3xl font-extrabold text-purple-700 mb-2">Rak-GPT</h1>
          {/* 안내문구 */}
          <p className="mb-8 text-gray-600 text-center">
            Leave Your Voice Instantly<br />
            No login required for get started chat with our AI powered chatbot.
          </p>
          {/* 시작하기 버튼 */}
          <button
            className="bg-purple-500 text-white px-8 py-3 rounded-full text-lg font-semibold shadow-lg"
            onClick={() => setShowChat(true)}
          >
            시작하기
          </button>
        </div>
      </div>
    );
  }

  // 챗봇화면
  return <Chatbot />;
}

export default App;
