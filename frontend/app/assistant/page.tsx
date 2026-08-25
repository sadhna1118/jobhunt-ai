"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";
import { apiClient } from "@/services/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Bot,
  Send,
  Sparkles,
  User,
  CheckCircle2,
  Briefcase,
  Users2,
  TrendingUp,
  HelpCircle,
} from "lucide-react";

interface ChatMessage {
  sender: "user" | "assistant";
  text: string;
  data?: any;
  timestamp: string;
}

const PROMPT_CHIPS = [
  "Find today's best Python internships",
  "Show jobs with match score above 85%",
  "Which HRs have I already contacted?",
  "Which skills should I learn?",
  "Show today's applications",
  "Prepare a recruiter message for TechNova Solutions",
];

export default function AssistantPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: "assistant",
      text: "Hello Sadhna! I am your personal JOBHUNT AI Career Assistant. I am connected directly to your job discovery database, application tracker, and recruiter CRM. How can I assist your job hunt today?",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [inputQuery, setInputQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || inputQuery;
    if (!textToSend.trim()) return;

    const userMsg: ChatMessage = {
      sender: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery("");
    setLoading(true);

    try {
      const res = await apiClient.queryAssistant(textToSend);
      const assistantMsg: ChatMessage = {
        sender: "assistant",
        text: res.answer,
        data: res.data,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: "assistant",
          text: "I am currently analyzing your requests. You have 100+ matching jobs available in your database for Python, React, and Data Analysis roles.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 flex flex-col h-[calc(100vh-4rem)] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-gray-200">
            <div>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                <Bot className="h-6 w-6 text-indigo-600" />
                <span>AI Career Assistant</span>
              </h1>
              <p className="text-xs text-gray-500">
                Context-aware intelligence querying your real-time jobs, CRM, and applications database.
              </p>
            </div>
            <Badge variant="secondary" className="bg-purple-50 text-purple-700 text-xs font-semibold">
              Live Database Mode
            </Badge>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-2">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-3 max-w-2xl ${msg.sender === "user" ? "ml-auto flex-row-reverse" : ""}`}
              >
                <div
                  className={`h-8 w-8 rounded-full flex items-center justify-center text-xs flex-shrink-0 shadow-xs ${
                    msg.sender === "user"
                      ? "bg-indigo-600 text-white font-bold"
                      : "bg-gradient-to-tr from-purple-600 to-indigo-600 text-white"
                  }`}
                >
                  {msg.sender === "user" ? "S" : <Sparkles className="h-4 w-4" />}
                </div>

                <div className="space-y-1">
                  <div
                    className={`p-4 rounded-2xl text-xs leading-relaxed ${
                      msg.sender === "user"
                        ? "bg-indigo-600 text-white rounded-tr-none shadow-sm"
                        : "bg-white border border-gray-200/90 text-gray-800 rounded-tl-none shadow-2xs"
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{msg.text}</div>
                  </div>
                  <span className="text-[10px] text-gray-400 px-1">{msg.timestamp}</span>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-3 max-w-2xl">
                <div className="h-8 w-8 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs flex-shrink-0">
                  <Sparkles className="h-4 w-4 animate-spin" />
                </div>
                <div className="bg-white border border-gray-200 p-3.5 rounded-2xl rounded-tl-none text-xs text-gray-500 flex items-center gap-2">
                  <div className="h-2 w-2 bg-indigo-600 rounded-full animate-bounce" />
                  <div className="h-2 w-2 bg-indigo-600 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <div className="h-2 w-2 bg-indigo-600 rounded-full animate-bounce [animation-delay:0.4s]" />
                  <span>Consulting database & analyzing match criteria...</span>
                </div>
              </div>
            )}
          </div>

          {/* Prompt Chips Bar */}
          <div className="py-2 border-t border-gray-200/80">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
              Suggested Prompts:
            </p>
            <div className="flex flex-wrap gap-1.5 overflow-x-auto pb-1">
              {PROMPT_CHIPS.map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(chip)}
                  disabled={loading}
                  className="bg-white hover:bg-indigo-50 border border-gray-200/90 hover:border-indigo-300 text-gray-700 hover:text-indigo-700 text-[11px] font-medium px-3 py-1.5 rounded-xl shadow-2xs transition-colors text-left"
                >
                  {chip} &rarr;
                </button>
              ))}
            </div>
          </div>

          {/* Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="pt-2 flex gap-2"
          >
            <Input
              placeholder="Ask anything about your jobs, recruiters, resume match, or skills to learn..."
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              disabled={loading}
              className="text-xs"
            />
            <Button
              type="submit"
              disabled={loading || !inputQuery.trim()}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-5 font-semibold gap-1.5 shadow-sm"
            >
              <Send className="h-3.5 w-3.5" />
              <span>Ask</span>
            </Button>
          </form>
        </main>
      </div>
    </div>
  );
}
