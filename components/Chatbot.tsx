"use client";
import React, { useState, useEffect, useRef, KeyboardEvent } from "react";
import { Send, Minimize2, Maximize2, X } from "lucide-react";
import Image from "next/image";
import { useChatbot } from "../context/ChatbotContext";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function ChatbotWindow() {
  const { isChatbotOpen, closeChatbot } = useChatbot();
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Welcome to TraceX Legal Chat. I only answer questions related to crimes and legal matters under the Indian Penal Code (IPC). How can I assist you?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Smooth scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const toggleMinimize = () => {
    setIsMinimized((prev) => !prev);
  };

  // Function to simulate typing animation for assistant's response
  const simulateTyping = (fullText: string) => {
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setMessages((prev) => {
        const newMessages = [...prev];
        const lastIndex = newMessages.length - 1;
        if (lastIndex >= 0 && newMessages[lastIndex].role === "assistant") {
          newMessages[lastIndex].content = fullText.slice(0, i);
        }
        return newMessages;
      });
      if (i >= fullText.length) {
        clearInterval(interval);
      }
    }, 15); // Adjust for typing speed
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    setIsLoading(true);
    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    const userInput = input;
    setInput("");

    try {
      const res = await fetch("/api/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userInput }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error("Chatbot API error:", errorText);
        throw new Error("Chatbot API request failed");
      }

      const data = await res.json();
      if (data.error) {
        throw new Error(data.error);
      }

      const fullText = data.reply || "No reply received.";
      // Append an empty assistant message to start typing animation
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);
      simulateTyping(fullText);
    } catch (error) {
      console.error("Error calling chatbot API:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, there was an error. Please try again later.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div
      className={`fixed bottom-6 right-6 bg-white rounded-lg shadow-xl z-50 transition-all duration-700 ease-in-out overflow-hidden flex flex-col
        ${isMinimized ? "w-72 h-14" : "w-72 md:w-96 h-96 md:h-[512px]"}
        ${isChatbotOpen ? "translate-y-0 opacity-100" : "translate-y-full opacity-0 pointer-events-none"}`}
    >
      {/* Chat Header */}
      <div className="bg-blue-600 text-white p-3 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Image
            src="/chatbot-robot.png"
            alt="Chat"
            width={24}
            height={24}
            className="w-6 h-6 rounded-full object-cover"
          />
          <span className="font-medium">TraceX Legal Chat</span>
        </div>
        <div className="flex gap-2">
          <button onClick={toggleMinimize} className="text-white hover:text-gray-200 focus:outline-none">
            {isMinimized ? <Maximize2 size={18} /> : <Minimize2 size={18} />}
          </button>
          <button onClick={closeChatbot} className="text-white hover:text-gray-200 focus:outline-none">
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Chat Content and Input Area */}
      {!isMinimized && (
        <>
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
            {messages.map((msg, index) => (
              <div key={index} className={`mb-4 flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    msg.role === "user"
                      ? "bg-blue-600 text-white rounded-tr-none"
                      : "bg-gray-200 text-black rounded-tl-none"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start mb-4">
                <div className="bg-gray-200 text-black rounded-lg rounded-tl-none p-3 max-w-[80%]">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" />
                    <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: "300ms" }} />
                    <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: "600ms" }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <div className="border-t border-gray-200 p-3 bg-white">
            <div className="relative">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Type your legal query..."
                className="w-full border border-gray-300 rounded-lg pl-3 pr-10 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
                rows={1}
                disabled={isLoading}
              />
              <button
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className={`absolute right-2 top-1/2 transform -translate-y-1/2 transition-colors duration-300 ${
                  !input.trim() ? "text-gray-400" : "text-blue-600 hover:text-blue-800"
                }`}
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
