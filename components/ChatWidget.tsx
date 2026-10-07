"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import avatar from "../public/avatar.jpg";

type Message = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "What do you work on at Meta?",
  "What's your background?",
  "What are you building for fun?",
];

function Avatar({ size }: { size: number }) {
  return (
    <Image
      src={avatar}
      alt=""
      width={size}
      height={size}
      className="shrink-0 rounded-full object-cover"
      style={{ width: size, height: size }}
    />
  );
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  // Close on a click/tap outside the panel (the toggle button handles itself)
  // or on Escape.
  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: PointerEvent) {
      const target = e.target as Node;
      if (
        panelRef.current?.contains(target) ||
        toggleRef.current?.contains(target)
      ) {
        return;
      }
      setOpen(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  // Keep the latest message in view while replies stream in.
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, loading]);

  async function send(override?: string) {
    const text = (override ?? input).trim();
    if (!text || loading) return;
    const next = [...messages, { role: "user" as const, content: text }];
    setMessages(next);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next.slice(-10) }),
      });

      // JSON responses (including errors like 429/502) carry a message to show.
      const contentType = res.headers.get("content-type") ?? "";
      if (contentType.includes("application/json")) {
        const data = await res.json();
        setMessages((m) => [
          ...m,
          {
            role: "assistant",
            content:
              data.reply ??
              data.error ??
              "Sorry — the chat backend isn't configured yet. Check back soon.",
          },
        ]);
        return;
      }

      if (!res.ok || !res.body) {
        throw new Error(`chat failed: ${res.status}`);
      }

      // Stream SSE tokens.
      setMessages((m) => [...m, { role: "assistant", content: "" }]);
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith("data:")) continue;
          const payload = trimmed.slice(5).trim();
          if (payload === "[DONE]") continue;
          try {
            const json = JSON.parse(payload);
            const token: string =
              json.choices?.[0]?.delta?.content ??
              json.choices?.[0]?.message?.content ??
              "";
            if (token) {
              setMessages((m) => {
                const copy = [...m];
                copy[copy.length - 1] = {
                  role: "assistant",
                  content: copy[copy.length - 1].content + token,
                };
                return copy;
              });
            }
          } catch {
            /* ignore partial chunks */
          }
        }
      }
    } catch {
      setMessages((m) => [
        ...m,
        { role: "assistant", content: "Something went wrong — try again." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  const waitingForReply =
    loading && messages[messages.length - 1]?.role === "user";

  return (
    <>
      <button
        ref={toggleRef}
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close chat" : "Open chat"}
        aria-expanded={open}
        className={`fixed bottom-6 right-6 z-50 grid size-14 place-items-center overflow-hidden rounded-full shadow-lg shadow-black/50 transition hover:scale-105 ${
          open
            ? "bg-zinc-900 text-zinc-100 ring-1 ring-zinc-700 hover:bg-zinc-800"
            : "ring-2 ring-zinc-200 hover:ring-white"
        }`}
      >
        {open ? (
          <svg
            aria-hidden
            viewBox="0 0 24 24"
            className="size-6 motion-safe:animate-spin-in"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
          >
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        ) : (
          <Avatar size={56} />
        )}
      </button>

      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="fixed bottom-9 right-[92px] z-50 rounded-2xl rounded-br-sm bg-white px-4 py-2 text-sm font-medium text-black shadow-lg shadow-black/40 whitespace-nowrap hover:bg-zinc-100 motion-safe:animate-float"
        >
          Ask my AI anything 👋
        </button>
      )}

      {open && (
        <div
          ref={panelRef}
          role="dialog"
          aria-label="Chat with Nate's AI"
          className="fixed bottom-24 inset-x-3 z-50 flex h-[min(540px,calc(100dvh-8rem))] origin-bottom-right flex-col overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950/95 text-left shadow-2xl shadow-black/60 backdrop-blur-xl motion-safe:animate-pop-in sm:inset-x-auto sm:right-6 sm:w-[390px]"
        >
          <div className="flex items-center gap-3 border-b border-zinc-800/80 bg-zinc-900/60 px-4 py-3">
            <span className="relative">
              <Avatar size={40} />
              <span className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full bg-emerald-400 ring-2 ring-zinc-900" />
            </span>
            <div className="leading-tight">
              <p className="font-semibold text-zinc-100">Nate&apos;s AI</p>
              <p className="text-xs text-zinc-400">Usually replies in seconds</p>
            </div>
          </div>

          <div
            className="flex-1 space-y-4 overflow-y-auto px-4 py-5 text-sm"
            aria-live="polite"
          >
            {messages.length === 0 && (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <Avatar size={64} />
                <p className="mt-3 font-semibold text-zinc-100">
                  Hey, I&apos;m Nate&apos;s AI 👋
                </p>
                <p className="mt-1 text-zinc-400">
                  Ask about my work, background, or projects.
                </p>
                <div className="mt-5 flex w-full flex-col gap-2">
                  {SUGGESTIONS.map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => send(q)}
                      className="rounded-full border border-zinc-700 px-4 py-2 text-zinc-200 transition hover:border-zinc-400 hover:bg-zinc-900"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((m, i) =>
              m.role === "user" ? (
                <div
                  key={i}
                  className="ml-auto w-fit max-w-[80%] whitespace-pre-wrap rounded-2xl rounded-br-md bg-white px-4 py-2.5 leading-relaxed text-zinc-900"
                >
                  {m.content}
                </div>
              ) : (
                <div key={i} className="flex items-end gap-2">
                  <Avatar size={28} />
                  <div className="max-w-[80%] whitespace-pre-wrap rounded-2xl rounded-bl-md bg-zinc-800/80 px-4 py-2.5 leading-relaxed text-zinc-100">
                    {m.content}
                  </div>
                </div>
              )
            )}

            {waitingForReply && (
              <div className="flex items-end gap-2">
                <Avatar size={28} />
                <div
                  className="flex gap-1 rounded-2xl rounded-bl-md bg-zinc-800/80 px-4 py-3.5"
                  aria-label="Nate's AI is typing"
                  role="status"
                >
                  {[0, 150, 300].map((delay) => (
                    <span
                      key={delay}
                      className="size-1.5 rounded-full bg-zinc-400 motion-safe:animate-bounce"
                      style={{ animationDelay: `${delay}ms` }}
                    />
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <form
            className="border-t border-zinc-800/80 p-3"
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
          >
            <div className="flex items-center gap-2 rounded-full border border-zinc-600 bg-zinc-900 py-1.5 pl-4 pr-1.5 transition focus-within:border-zinc-300">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything…"
                aria-label="Your message"
                enterKeyHint="send"
                className="min-w-0 flex-1 bg-transparent text-base text-zinc-100 outline-none placeholder:text-zinc-400 sm:text-sm"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                aria-label="Send"
                className="grid size-9 shrink-0 place-items-center rounded-full bg-white text-zinc-900 transition hover:bg-zinc-200 disabled:bg-zinc-700 disabled:text-zinc-400"
              >
                <svg
                  aria-hidden
                  viewBox="0 0 24 24"
                  className="size-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.25}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 19V5M5 12l7-7 7 7" />
                </svg>
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
