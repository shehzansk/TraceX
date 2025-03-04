"use client";
import React, { useState, useEffect, useRef, KeyboardEvent } from "react";
import { Send, Minimize2, Maximize2, X } from "lucide-react";
import Image from "next/image";

// Define a message type
interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  // These are the messages that will cycle every 2 seconds when chat is closed
  const cycleTexts = ["Hello, I am John.", "How can I assist you?"];
  const [cycleIndex, setCycleIndex] = useState(0);

  // Conversation messages (when chat is open)
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

  // Cycle the closed-state text every 2 seconds
  useEffect(() => {
    const intervalId = setInterval(() => {
      setCycleIndex((prev) => (prev + 1) % cycleTexts.length);
    }, 2000);
    return () => clearInterval(intervalId);
  }, []);

  // Scroll to the bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Toggle chat window open/close
  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  // Minimize or maximize the chat window
  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  // Send the user message to the AI route
  const handleSend = async () => {
    if (!input.trim()) return;
    setIsLoading(true);

    // Add user message to local state
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

      const assistantMessage: Message = {
        role: "assistant",
        content: data.reply || "No reply received.",
      };
      setMessages((prev) => [...prev, assistantMessage]);
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

  // Handle Enter key
  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // If chat is closed: show circular robot image (bigger) with cycling text below it.
  if (!isOpen) {
    return (
      <>
        <button
          onClick={toggleChat}
          className="
            fixed bottom-6 right-6 z-50 flex flex-col items-center gap-2
            p-3 bg-transparent hover:scale-105 transition-all duration-300
          "
        >
          <Image
            src="/chatbot-robot.png"
            alt="Chat"
            width={100}
            height={100}
            className="w-24 h-24 rounded-full object-cover"
          />
          <span className="text-sm font-semibold text-blue-600 text-center leading-tight">
            {cycleTexts[cycleIndex]}
          </span>
        </button>
      </>
    );
  }

  // Chat is open
  return (
    <div
      className={`fixed bottom-6 right-6 bg-white rounded-lg shadow-xl z-50 transition-all duration-300 overflow-hidden flex flex-col ${
        isMinimized ? "w-72 h-14" : "w-72 md:w-96 h-96 md:h-[512px]"
      }`}
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
          <button
            onClick={toggleMinimize}
            className="text-white hover:text-gray-200 focus:outline-none"
          >
            {isMinimized ? <Maximize2 size={18} /> : <Minimize2 size={18} />}
          </button>
          <button
            onClick={toggleChat}
            className="text-white hover:text-gray-200 focus:outline-none"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      {!isMinimized && (
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`mb-4 flex ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
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
                  {/* Typing indicator */}
                  <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" />
                  <div
                    className="w-2 h-2 rounded-full bg-gray-500 animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  />
                  <div
                    className="w-2 h-2 rounded-full bg-gray-500 animate-bounce"
                    style={{ animationDelay: "600ms" }}
                  />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      )}

      {/* Input Area */}
      {!isMinimized && (
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
              className={`absolute right-2 top-1/2 transform -translate-y-1/2 ${
                !input.trim()
                  ? "text-gray-400"
                  : "text-blue-600 hover:text-blue-800"
              } transition-colors duration-300`}
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
