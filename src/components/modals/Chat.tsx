import React, { useState, useEffect, useRef } from "react";
import { IoMdClose } from "react-icons/io";

type Message = {
  id: string;
  text: string;
  from: "user" | "ai";
  timestamp: number;
};

type ChatProps = {
  isOpen: boolean;
  onClose: () => void;
};

const STORAGE_KEY = "chat_messages";
const RATE_LIMIT_MS = 1000;

const Chat: React.FC<ChatProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [lastMessageTime, setLastMessageTime] = useState<number>(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedMessages = localStorage.getItem(STORAGE_KEY);
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const now = Date.now();
    if (now - lastMessageTime < RATE_LIMIT_MS) {
      return;
    }

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      text: input,
      from: "user",
      timestamp: now,
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setLastMessageTime(now);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedMessages));
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: input,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get AI response");
      }

      const data = await response.json();

      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        text: data.reply,
        from: "ai",
        timestamp: Date.now(),
      };

      const finalMessages = [...updatedMessages, aiMessage];
      setMessages(finalMessages);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(finalMessages));
    } catch (err) {
      console.error("Failed to send message:", err);
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        text: "Sorry, I couldn't process your message. Please try again.",
        from: "ai",
        timestamp: Date.now(),
      };
      const errorMessages = [...updatedMessages, errorMessage];
      setMessages(errorMessages);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(errorMessages));
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
        onClick={onClose}
      />
      <div
        className={`fixed z-50 flex flex-col overflow-hidden transition-all duration-300 ease-in-out
        md:bottom-3 md:right-3 md:w-[500px] md:top-3 rounded-2xl
        inset-0 md:inset-auto
        bg-white/15 dark:bg-white/10 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-2xl`}
      >
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-white/20 dark:border-white/10 bg-white/5 dark:bg-white/3 backdrop-blur-sm">
          <h2 className="text-gray-900 dark:text-white font-semibold text-lg">Chat with Me</h2>
          <button
            onClick={onClose}
            className="text-gray-700 dark:text-white/80 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-white/10 p-2 rounded-lg transition-all duration-200"
          >
            <IoMdClose size={24} />
          </button>
        </div>

        <div className="flex-1 p-4 md:p-6 overflow-y-auto space-y-3 bg-white/5 dark:bg-white/3">
          {messages.length === 0 && (
            <div className="flex items-center justify-center h-full text-center">
              <p className="text-gray-600 dark:text-white/60">Start a conversation! 💬</p>
            </div>
          )}
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}
            >
            <div
              className={`px-4 py-2 rounded-xl max-w-[70%] break-words backdrop-blur-sm transition-all ${
                msg.from === "user"
                  ? "bg-pink-500/60 dark:bg-pink-600/50 text-white"
                  : "bg-white/30 dark:bg-white/15 text-gray-900 dark:text-white"
              }`}
            >
              {msg.text}
            </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="px-4 py-2 rounded-xl bg-white/30 dark:bg-white/15 text-gray-900 dark:text-white">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 md:p-6 border-t border-white/20 dark:border-white/10 flex items-center gap-2 bg-white/5 dark:bg-white/3 backdrop-blur-sm">
          <input
            type="text"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 rounded-xl bg-white/20 dark:bg-white/10 backdrop-blur-md text-gray-900 dark:text-white placeholder:text-gray-600 dark:placeholder:text-white/40 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500/60 transition-all"
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSend();
            }}
          />
          <button
            onClick={handleSend}
            className="bg-pink-500/60 dark:bg-pink-600/50 hover:bg-pink-500/80 dark:hover:bg-pink-600/70 text-white px-4 py-2 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            {isLoading ? "..." : "Send"}
          </button>
        </div>
      </div>
    </>
  );
};

export default Chat;
