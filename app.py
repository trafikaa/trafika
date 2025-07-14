import gradio as gr
from chatbot import ChatBot02

bot = ChatBot02()

with gr.Blocks() as demo:
    chatbot = gr.Chatbot(label="AI 챗봇", type="messages", height=500)
    msg = gr.Textbox(placeholder="메시지를 입력하세요.", label="메시지")
    # btn2 = gr.Button("초기화")

    msg.submit(bot.response, inputs=[msg, chatbot], outputs=[chatbot, msg])

    save_btn = gr.Button("💾 저장")
    load_btn = gr.Button("📂 불러오기")
    clear_btn = gr.Button("🧹 초기화")
    status = gr.Markdown("")

    save_btn.click(fn=bot.save_history, inputs=[chatbot], outputs=[status])
    load_btn.click(fn=bot.load_history, inputs=[], outputs=[chatbot])
    clear_btn.click(lambda: [], inputs=None, outputs=chatbot)

demo.launch(share=True)