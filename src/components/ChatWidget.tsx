import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, X, Send, Loader2, Bot, Phone, ArrowRight } from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

const WELCOME_MESSAGE: ChatMessage = {
  role: 'model',
  text: 'Сайн байна уу! Би BARILGA EXPO-ийн AI туслах. Үзэсгэлэнгийн огноо, байршил, талбай захиалга, холбоо барих мэдээллийн талаар асуугаарай.',
};

// Текст дотор байгаа [label](url) markdown линкийг танигдах товч болгон рендэрлэнэ
const renderMessageContent = (
  text: string,
  navigate: (path: string) => void,
  closeChat: () => void,
) => {
  const linkRegex = /\[([^\]]+)\]\((\/[^\s)]*|tel:[^\s)]+|https?:\/\/[^\s)]+)\)/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = linkRegex.exec(text)) !== null) {
    const [full, label, url] = match;
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    const isTel = url.startsWith('tel:');
    const isInternal = url.startsWith('/');
    const Icon = isTel ? Phone : ArrowRight;

    if (isInternal) {
      parts.push(
        <button
          key={`link-${key++}`}
          onClick={() => {
            closeChat();
            navigate(url);
          }}
          className="inline-flex items-center gap-1.5 my-1 px-3 py-1.5 rounded-full bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition-colors"
        >
          {label}
          <Icon className="w-3.5 h-3.5" />
        </button>,
      );
    } else {
      parts.push(
        <a
          key={`link-${key++}`}
          href={url}
          target={isTel ? undefined : '_blank'}
          rel={isTel ? undefined : 'noopener noreferrer'}
          className="inline-flex items-center gap-1.5 my-1 px-3 py-1.5 rounded-full bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition-colors no-underline"
        >
          {label}
          <Icon className="w-3.5 h-3.5" />
        </a>,
      );
    }

    lastIndex = match.index + full.length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts;
};

export const ChatWidget: React.FC = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open, loading]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const nextMessages: ChatMessage[] = [...messages, { role: 'user', text }];
    setMessages(nextMessages);
    setInput('');
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: nextMessages }),
      });

      // Хариу JSON биш байж болзошгүй (сервер алдаа г.м) — аюулгүй уншина
      const raw = await res.text();
      let data: any = null;
      try { data = raw ? JSON.parse(raw) : null; } catch { /* JSON биш */ }

      if (!res.ok || !data) {
        throw new Error(
          (data && data.error) ||
            'Чат түр зуур ажиллахгүй байна. Хэсэг хүлээгээд дахин оролдоно уу.',
        );
      }

      setMessages(prev => [...prev, { role: 'model', text: data.reply }]);
    } catch (e: any) {
      setError(e?.message || 'Холболтын алдаа гарлаа. Дахин оролдоно уу.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Floating toggle button */}
      <button
        onClick={() => setOpen(o => !o)}
        aria-label="AI чат нээх"
        className="fixed bottom-5 right-5 z-[200] w-14 h-14 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-2xl flex items-center justify-center transition-all hover:scale-105 hover:opacity-100 opacity-60 focus:outline-none focus:ring-4 focus:ring-red-400/40"
      >
        {open ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-24 right-5 z-[200] w-[92vw] max-w-sm h-[70vh] max-h-[600px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden animate-fade-in">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-950 to-blue-900 text-white px-4 py-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-red-500/20 border border-red-400/30 flex items-center justify-center shrink-0">
              <Bot className="w-5 h-5 text-red-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-sm leading-tight truncate">BARILGA EXPO AI туслах</div>
              <div className="text-[11px] text-blue-200/70 leading-tight">Танд тусламж хэрэгтэй юу?</div>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Хаах" className="text-white/60 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-4 space-y-3 bg-gray-50">
            {messages.map((m, idx) => (
              <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm whitespace-pre-wrap leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-red-600 text-white rounded-br-sm'
                      : 'bg-white text-gray-800 border border-gray-200 rounded-bl-sm shadow-sm'
                  }`}
                >
                  {m.role === 'model'
                    ? renderMessageContent(m.text, navigate, () => setOpen(false))
                    : m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-sm px-3 py-2 shadow-sm flex items-center gap-2 text-gray-500 text-sm">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Бичиж байна...
                </div>
              </div>
            )}
            {error && (
              <div className="text-center text-xs text-red-500 px-2">{error}</div>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-gray-200 p-2 flex items-end gap-2 bg-white">
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Асуултаа бичнэ үү..."
              rows={1}
              className="flex-1 resize-none rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400/40 max-h-24"
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              aria-label="Илгээх"
              className="w-10 h-10 shrink-0 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};
