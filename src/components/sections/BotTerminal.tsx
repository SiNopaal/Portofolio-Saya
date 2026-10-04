"use client";

import { useState, useRef, useEffect } from "react";
import { Terminal, RotateCcw, Sparkles, Send, Bot, User, Code, Layers } from "lucide-react";

type ChatMessage = {
  id: string;
  role: "system" | "user" | "assistant";
  content: string;
  source?: string;
  timestamp?: string;
};

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: "init-1",
    role: "system",
    content: "// Naufal AI Terminal Assistant v2.6 initialized [Status: ONLINE]",
  },
  {
    id: "init-2",
    role: "system",
    content: "// Knowledge Engine connected. Ready for Gemini / OpenAI API integration.",
  },
  {
    id: "init-3",
    role: "assistant",
    content: "Halo! Saya adalah AI Assistant Naufal Maulana. Anda bisa menanyakan apa saja seputar portofolio, keahlian frontend Next.js/React, proyek otomasi bot AI, pengalaman magang di PT Seven Inc, atau cara menghubungi Naufal. Silakan ketik pertanyaan Anda atau gunakan tombol cepat di atas!",
  },
];

const SUGGESTED_PROMPTS = [
  { label: "Siapa Naufal?", query: "Ceritakan profil dan latar belakang Naufal Maulana." },
  { label: "Tech Stack", query: "Apa saja teknologi dan bahasa pemrograman yang dikuasai Naufal?" },
  { label: "Laundry Suite", query: "Jelaskan tentang proyek Commercial Laundry Suite yang dipimpin Naufal." },
  { label: "Patukrejomulyo E-Gov", query: "Ceritakan tentang sistem Patukrejomulyo E-Gov." },
  { label: "Cara Kontak", query: "Bagaimana cara menghubungi Naufal untuk tawaran kerja atau proyek?" },
];

export function BotTerminal() {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [inputVal, setInputVal] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const screenRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (screenRef.current) {
      screenRef.current.scrollTop = screenRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    if (trimmed.toLowerCase() === "clear" || trimmed.toLowerCase() === "/clear" || trimmed.toLowerCase() === "cls") {
      setMessages([
        {
          id: String(Date.now()),
          role: "system",
          content: "// Terminal buffer cleared. AI Assistant ready for new queries.",
        },
      ]);
      setInputVal("");
      return;
    }

    const userMsg: ChatMessage = {
      id: String(Date.now()),
      role: "user",
      content: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputVal("");
    setIsLoading(true);

    try {
      const history = messages
        .filter((m) => m.role === "user" || m.role === "assistant")
        .slice(-6)
        .map((m) => ({ role: m.role, content: m.content }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed, history }),
      });

      if (!res.ok) {
        throw new Error("Gagal mendapatkan respon dari AI server.");
      }

      const data = await res.json();
      const replyText = data.reply || "Maaf, AI tidak memberikan respon.";

      const assistantMsg: ChatMessage = {
        id: String(Date.now() + 1),
        role: "assistant",
        content: replyText,
        source: data.source,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: String(Date.now() + 1),
          role: "system",
          content: "❌ Maaf, terjadi kendala saat menghubungi AI Assistant. Silakan coba lagi.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendMessage(inputVal);
    }
  };

  return (
    <section id="terminal" className="relative mx-auto max-w-5xl px-6 py-20">
      <div className="mb-8 space-y-2 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3.5 py-1 text-xs font-mono uppercase tracking-widest text-cyan-300">
          <Bot className="h-3.5 w-3.5 text-cyan-400" />
          <span>Interactive AI Terminal Chat</span>
        </div>
        <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
          Chat with Naufal&apos;s AI Assistant
        </h2>
        <p className="mx-auto max-w-lg text-sm text-slate-400">
          Tanyakan apa saja seputar portofolio, keahlian frontend Next.js/React, bot otomasi AI, hingga pengalaman proyek secara real-time.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-cyan-500/30 bg-[#0a0d16]/95 font-mono shadow-2xl backdrop-blur-xl">
        {/* Terminal Title Bar */}
        <div className="flex items-center justify-between border-b border-white/5 bg-[#121624] px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="inline-block h-3 w-3 rounded-full bg-rose-500/80" />
            <span className="inline-block h-3 w-3 rounded-full bg-amber-500/80" />
            <span className="inline-block h-3 w-3 rounded-full bg-emerald-500/80" />
            <span className="ml-2 text-xs text-slate-400">
              naufal-ai-agent &bull; v2.6 (Gemini / LLM Core)
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span>AI CHAT: ONLINE</span>
          </div>
        </div>

        {/* Quick Question Prompts */}
        <div className="flex flex-wrap items-center gap-2 border-b border-white/5 bg-[#0e1220]/70 px-4 py-2.5 text-xs">
          <span className="mr-1 text-slate-500 flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-cyan-400" />
            <span>Tanya Cepat:</span>
          </span>
          {SUGGESTED_PROMPTS.map((prompt) => (
            <button
              key={prompt.label}
              onClick={() => sendMessage(prompt.query)}
              disabled={isLoading}
              className="flex items-center gap-1.5 rounded-lg border border-cyan-500/25 bg-cyan-500/10 px-2.5 py-1 text-cyan-300 transition-all hover:border-cyan-400 hover:bg-cyan-500/20 active:scale-95 disabled:opacity-50"
            >
              <span>{prompt.label}</span>
            </button>
          ))}
          <button
            onClick={() => sendMessage("clear")}
            className="ml-auto flex items-center gap-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 px-2.5 py-1 text-rose-300 transition-all hover:bg-rose-500/20 active:scale-95"
            title="Bersihkan layar chat"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Clear</span>
          </button>
        </div>

        {/* Terminal Chat Screen */}
        <div
          ref={screenRef}
          className="h-80 space-y-3 overflow-y-auto bg-black/60 p-5 text-xs sm:text-sm leading-relaxed"
        >
          {messages.map((msg) => {
            if (msg.role === "system") {
              return (
                <div key={msg.id} className="text-slate-500 text-xs italic">
                  {msg.content}
                </div>
              );
            }
            if (msg.role === "user") {
              return (
                <div key={msg.id} className="flex items-start gap-2.5 text-cyan-300">
                  <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded bg-cyan-500/20 text-cyan-400 mt-0.5">
                    <User className="h-3 w-3" />
                  </div>
                  <div className="flex-1">
                    <span className="font-bold text-cyan-400 mr-2">&gt; You:</span>
                    <span className="text-cyan-100 font-sans">{msg.content}</span>
                  </div>
                </div>
              );
            }
            return (
              <div key={msg.id} className="flex items-start gap-2.5 text-slate-200">
                <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded bg-emerald-500/20 text-emerald-400 mt-0.5">
                  <Bot className="h-3 w-3" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-emerald-400">🤖 Naufal AI:</span>
                    {msg.source && (
                      <span className="rounded bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 text-[9px] font-mono text-emerald-300">
                        {msg.source.includes("vyceai") || msg.source.includes("gemini")
                          ? "⚡ Live AI"
                          : "🧠 Knowledge Engine"}
                      </span>
                    )}
                    {msg.timestamp && (
                      <span className="text-[10px] text-slate-500">{msg.timestamp}</span>
                    )}
                  </div>
                  <div className="whitespace-pre-line text-slate-200 font-sans text-xs sm:text-[13px] leading-relaxed pl-1 border-l-2 border-emerald-500/30">
                    {msg.content}
                  </div>
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex items-center gap-2 text-cyan-400 text-xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
              </span>
              <span className="animate-pulse">Naufal AI sedang merangkum jawaban...</span>
            </div>
          )}
        </div>

        {/* Terminal Chat Input Line */}
        <div className="flex items-center gap-2 border-t border-white/5 bg-[#121624]/90 px-4 py-3">
          <span className="font-bold text-cyan-400">&gt;</span>
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            placeholder="Tanyakan sesuatu ke AI... (contoh: 'Ceritakan pengalaman proyek laundry')"
            className="w-full bg-transparent font-mono text-xs sm:text-sm text-cyan-200 placeholder-slate-600 outline-none disabled:opacity-50"
          />
          <button
            onClick={() => sendMessage(inputVal)}
            disabled={isLoading || !inputVal.trim()}
            className="rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-lg shadow-cyan-500/20 hover:opacity-90 transition-all flex items-center gap-1.5 disabled:opacity-40"
          >
            <Send className="h-3 w-3" />
            <span className="hidden sm:inline">Kirim</span>
          </button>
        </div>
      </div>
    </section>
  );
}
