import { useState } from "react"

export default function Chatbot() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)

  const sendMessage = async () => {
    if (!input.trim()) return

    const userMessage = { sender: "user", text: input }
    const updatedMessages = [...messages, userMessage] // Adds new message to history

    setMessages(updatedMessages)
    setInput("")
    setIsTyping(true) // Activate "Typing..."

    try {
      const response = await fetch(
        "https://oklamonte-api.onrender.com/api/search",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            history: updatedMessages.map((msg) => ({
              role: msg.sender === "user" ? "user" : "assistant", // Change 'bot' to 'assistant'
              text: msg.text || "", // Ensure no null or undefined message text
            })),
            currentMessage: input.trim() || "", // Ensure currentMessage is valid
          }),
        }
      )

      const data = await response.json()

      const botMessage = {
        sender: "assistant", // Keep 'assistant' as sender here too
        text: data.response || "Sem resposta disponível.",
      }

      setTimeout(() => {
        setMessages((prev) => [...prev, botMessage])
        setIsTyping(false)
      }, 1000)
    } catch (error) {
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          { sender: "assistant", text: "Erro ao buscar resposta." },
        ])
        setIsTyping(false)
      }, 1000)
    }
  }

  const clearChat = () => {
    setMessages([])
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100 p-4 w-screen">
      <div className="flex-1 overflow-auto p-4 bg-white shadow-md rounded-md flex flex-col">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`mb-2 p-2 rounded-md max-w-[75%] break-words ${
              msg.sender === "user"
                ? "bg-blue-500 text-white self-end"
                : "bg-gray-300 text-black self-start"
            }`}
          >
            {msg.text}
          </div>
        ))}

        {isTyping && (
          <div className="self-start bg-gray-300 text-black p-2 rounded-md max-w-[75%] animate-pulse">
            Digitando...
          </div>
        )}
      </div>

      {/* Campo de entrada e botões */}
      <div className="mt-4 flex">
        <input
          type="text"
          className="flex-1 p-2 border rounded-l-md"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Digite sua mensagem..."
        />
        <button className="p-2 bg-blue-500 text-white" onClick={sendMessage}>
          Enviar
        </button>
        <button
          className="p-2 bg-red-500 text-white rounded-r-md ml-2"
          onClick={clearChat}
        >
          Limpar
        </button>
      </div>
    </div>
  )
}
