"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import avatar from "../public/avatar.jpg";

type Message = { role: "user" | "assistant"; content: string };

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

  async function send() {
    const text = input.trim();
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
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }

  return (
    <>
      <button
        ref={toggleRef}
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close chat" : "Open chat"}
        aria-expanded={open}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full overflow-hidden bg-white text-black text-2xl shadow-lg ring-2 ring-zinc-200 hover:ring-white hover:scale-105 transition z-50"
      >
        {open ? (
          "✕"
        ) : (
          <Image
            src={avatar}
            alt=""
            width={56}
            height={56}
            className="size-full object-cover"
          />
        )}
      </button>

      {open && (
        <div
          ref={panelRef}
          className="fixed bottom-24 inset-x-3 sm:inset-x-auto sm:right-6 sm:w-[380px] h-[min(480px,calc(100dvh-8rem))] text-left bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden z-50">
          <div className="px-4 py-3 border-b border-zinc-800">
            <p className="font-semibold text-sm">Ask Nate&apos;s AI</p>
            <p className="text-xs text-zinc-400">
              Answers about me, on my behalf
            </p>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 text-sm"
            aria-live="polite"
          >
            {messages.length === 0 && (
              <p className="text-zinc-400">
                Hi! Ask me about my background, work, or projects.
              </p>
            )}
            {messages.map((m, i) => (
              <div
                key={i}
                className={`max-w-[85%] px-3 py-2 rounded-xl leading-relaxed whitespace-pre-wrap ${
                  m.role === "user"
                    ? "ml-auto bg-white text-black"
                    : "mr-auto bg-zinc-800 text-zinc-100"
                }`}
              >
                {m.content}
              </div>
            ))}
            {loading && messages[messages.length - 1]?.role === "user" && (
              <div className="mr-auto bg-zinc-800 text-zinc-400 px-3 py-2 rounded-xl text-sm">
                thinking…
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <form
            className="p-3 border-t border-zinc-800 flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask something…"
              aria-label="Your message"
              enterKeyHint="send"
              className="flex-1 bg-zinc-900 border border-zinc-500 rounded-xl px-3 py-2 text-base sm:text-sm text-zinc-100 placeholder:text-zinc-400 outline-none focus:border-zinc-200"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-xl bg-white text-black text-sm font-medium disabled:opacity-50"
            >
              Send
            </button>
          </form>
        </div>
      )}
    </>
  );
}
