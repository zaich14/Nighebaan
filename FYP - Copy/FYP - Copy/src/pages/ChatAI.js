import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { sendChatMessage } from "../services/api";

const SUGGESTIONS = [
  "What is a normal blood pressure?",
  "Tips for managing diabetes",
  "How can I sleep better?",
  "What foods are good for my heart?",
  "How often should I exercise?",
  "I missed my medication dose",
  "Signs of a heart attack",
  "How to prevent falls at home",
];

const getInitialMessage = () => ({
  role: "assistant",
  content: "Hello! I'm your **Nigehbaan Health Assistant**. I'm here to answer your health questions and provide guidance on managing your wellbeing.\n\nYou can ask me about blood pressure, medications, diet, exercise, sleep, or any health concern. How can I help you today?",
  time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
});

const chatStorageKey = (user) => `nigehbaan_chat_history_${user?.id || user?._id || user?.email || "guest"}`;

function renderMarkdown(text) {
  // Bold
  let html = text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  // Bullet points
  html = html.replace(/^• (.+)$/gm, "<li>$1</li>");
  html = html.replace(/(<li>.*<\/li>)/s, "<ul class='mt-2 space-y-1 list-none'>$1</ul>");
  // Line breaks
  html = html.replace(/\n\n/g, "</p><p class='mt-2'>");
  html = html.replace(/\n/g, "<br/>");
  return `<p>${html}</p>`;
}

function ChatBubble({ msg }) {
  const isUser = msg.role === "user";
  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      {/* Avatar */}
      <div className={`shrink-0 flex h-9 w-9 items-center justify-center rounded-2xl text-sm font-bold ${
        isUser ? "bg-teal-600 text-white" : "bg-indigo-100 text-indigo-700"
      }`}>
        {isUser ? "You" : "AI"}
      </div>

      {/* Bubble */}
      <div className={`max-w-[75%] rounded-3xl px-5 py-3.5 text-sm leading-relaxed ${
        isUser
          ? "bg-teal-600 text-white rounded-tr-md"
          : "bg-white text-slate-800 ring-1 ring-slate-200 rounded-tl-md"
      }`}>
        {isUser ? (
          <p>{msg.content}</p>
        ) : (
          <div
            className="prose-sm"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }}
          />
        )}
        <p className={`mt-1.5 text-xs ${isUser ? "text-teal-200" : "text-slate-400"}`}>
          {msg.time}
        </p>
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex gap-3">
      <div className="shrink-0 flex h-9 w-9 items-center justify-center rounded-2xl bg-indigo-100 text-sm font-bold text-indigo-700">
        AI
      </div>
      <div className="flex items-center gap-1.5 rounded-3xl rounded-tl-md bg-white px-5 py-4 ring-1 ring-slate-200">
        <span className="h-2 w-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "0ms" }} />
        <span className="h-2 w-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "150ms" }} />
        <span className="h-2 w-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "300ms" }} />
      </div>
    </div>
  );
}

function ChatAI() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [messages, setMessages] = useState([getInitialMessage()]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [historyNotice, setHistoryNotice] = useState("");
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) { navigate("/login"); return; }
    try {
      const parsed = JSON.parse(userData);
      setCurrentUser(parsed);
      const saved = localStorage.getItem(chatStorageKey(parsed));
      if (saved) {
        const savedMessages = JSON.parse(saved);
        if (Array.isArray(savedMessages) && savedMessages.length > 0) {
          setMessages(savedMessages);
        }
      }
    } catch { navigate("/login"); }
  }, [navigate]);

  useEffect(() => {
    if (!currentUser) return;
    localStorage.setItem(chatStorageKey(currentUser), JSON.stringify(messages));
  }, [currentUser, messages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const now = () =>
    new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

  const sendMessage = async (text) => {
    const content = (text || input).trim();
    if (!content || loading) return;

    const userMsg = { role: "user", content, time: now() };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput("");
    setLoading(true);

    try {
      // Send only role+content to backend (strip UI-only `time` field)
      const apiMessages = updated.map(({ role, content: c }) => ({ role, content: c }));
      const res = await sendChatMessage(apiMessages);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: res.data.reply, time: now() },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "I'm sorry, I couldn't process your request. Please try again.",
          time: now(),
        },
      ]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    if (currentUser) localStorage.removeItem(chatStorageKey(currentUser));
    setMessages([{ role: "assistant", content: "Chat cleared. How can I help you today?", time: now() }]);
    setHistoryNotice("");
  };

  const loadPreviousChat = () => {
    if (!currentUser) return;
    try {
      const saved = localStorage.getItem(chatStorageKey(currentUser));
      const savedMessages = saved ? JSON.parse(saved) : [];
      if (Array.isArray(savedMessages) && savedMessages.length > 0) {
        setMessages(savedMessages);
        setHistoryNotice("Previous chat loaded.");
      } else {
        setHistoryNotice("No previous chat found for this account.");
      }
    } catch {
      setHistoryNotice("Unable to load previous chat.");
    }
  };

  return (
    <div className="flex h-screen flex-col bg-slate-50 text-slate-900">
      <Navbar />

      <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col overflow-hidden px-4 pb-4 pt-6 sm:px-6">

        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-2 text-sm font-semibold text-teal-700 hover:text-teal-800"
            >
              ← Back
            </button>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-600 text-white text-sm font-bold">
                AI
              </div>
              <div>
                <p className="font-semibold text-slate-900">Nigehbaan Health Assistant</p>
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  <p className="text-xs text-slate-500">Online · Always available</p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={loadPreviousChat}
              className="rounded-xl bg-teal-50 px-3 py-2 text-xs font-semibold text-teal-700 hover:bg-teal-100"
            >
              Previous chat
            </button>
            <button
              onClick={clearChat}
              className="rounded-xl bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200"
            >
              Clear chat
            </button>
          </div>
        </div>

        {historyNotice && (
          <div className="mb-3 rounded-2xl border border-teal-100 bg-teal-50 px-4 py-2 text-xs font-medium text-teal-700">
            {historyNotice}
          </div>
        )}

        {/* Message area */}
        <div className="flex-1 overflow-y-auto rounded-3xl bg-slate-100/60 p-4 sm:p-6 space-y-4">
          {messages.map((msg, i) => (
            <ChatBubble key={i} msg={msg} />
          ))}
          {loading && <TypingIndicator />}
          <div ref={bottomRef} />
        </div>

        {/* Quick suggestions (show only at start) */}
        {messages.length <= 1 && !loading && (
          <div className="mt-3 flex flex-wrap gap-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => sendMessage(s)}
                className="rounded-2xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:border-teal-400 hover:bg-teal-50 hover:text-teal-700"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Input bar */}
        <div className="mt-3 flex items-end gap-2 rounded-3xl bg-white p-2 ring-1 ring-slate-200 focus-within:ring-teal-400 transition">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a health question… (Enter to send)"
            rows={1}
            className="flex-1 resize-none bg-transparent px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none"
            style={{ maxHeight: "120px" }}
            onInput={(e) => {
              e.target.style.height = "auto";
              e.target.style.height = e.target.scrollHeight + "px";
            }}
            disabled={loading}
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
            className="mb-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-teal-600 text-white transition hover:bg-teal-700 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
              <path d="M3.105 2.288a.75.75 0 0 0-.826.95l1.943 6.246H11a.75.75 0 0 1 0 1.5H4.222l-1.943 6.246a.75.75 0 0 0 .826.95 28.9 28.9 0 0 0 15.208-7.307.75.75 0 0 0 0-1.175A28.9 28.9 0 0 0 3.105 2.288Z" />
            </svg>
          </button>
        </div>
        <p className="mt-2 text-center text-xs text-slate-400">
          For medical emergencies call <strong>1122</strong>. This assistant provides general guidance only — always consult your doctor for medical decisions.
        </p>
      </div>
    </div>
  );
}

export default ChatAI;
