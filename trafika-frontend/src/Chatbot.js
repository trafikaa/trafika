import React, { useState, useRef, useEffect } from "react";
import { FaUser, FaRobot } from "react-icons/fa";

function Chatbot() {
  const [history, setHistory] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    setLoading(true);
    const userMsg = { role: "user", content: input };
    const newHistory = [...history, userMsg];

    const API_URL = process.env.REACT_APP_API_URL;
    console.log("API_URL:", API_URL);
    // FastAPI /chat 엔드포인트로 POST 요청
    const res = await fetch(`${API_URL}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: input, history: newHistory }),
    });
    const data = await res.json();
    setHistory(data.history || []);
    setInput("");
    setLoading(false);
  };

  const handleSave = async () => {
    const API_URL = process.env.REACT_APP_API_URL;
    const res = await fetch(`${API_URL}/save`);
    const data = await res.json();
    alert(data.message || "저장 완료!");
  };

  const handleLoad = async () => {
    const API_URL = process.env.REACT_APP_API_URL;
    const res = await fetch(`${API_URL}/load`);
    const data = await res.json();
    setHistory(data.history || []);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-pink-100 py-6">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 flex flex-col h-[600px]">
        {/* 상단 */}
        <div className="flex items-center justify-center mb-4">
          <img src="/logo.png" alt="Rak-GPT" className="w-10 h-10 mr-2" />
          <span className="text-xl font-bold text-purple-700">Rak-GPT</span>
        </div>
        {/* 대화창 */}
        <div className="flex-1 overflow-y-auto mb-4 bg-gray-50 rounded-xl p-4 h-96">
          {history.map((msg, idx) => (
            <div key={idx} className={`flex mb-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`flex items-end max-w-[80%] ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                {msg.role === "user" ? (
                  <FaUser className="ml-2 text-blue-400" />
                ) : (
                  <FaRobot className="mr-2 text-purple-400" />
                )}
                <div
                  className={`px-4 py-2 rounded-2xl shadow ${
                    msg.role === "user"
                      ? "bg-blue-100 text-blue-900"
                      : "bg-purple-100 text-purple-900"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>
        {/* 입력창 */}
        <div className="flex gap-2">
          <input
            className="flex-1 border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-200"
            placeholder="메시지를 입력하세요."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && sendMessage()}
            disabled={loading}
          />
          <button
            onClick={sendMessage}
            disabled={loading}
            className="bg-purple-500 text-white px-6 py-2 rounded-xl font-bold hover:bg-purple-600 transition"
          >
            {loading ? "..." : "전송"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Chatbot;
