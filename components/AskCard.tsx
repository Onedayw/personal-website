"use client";

import Image from "next/image";
import avatar from "../public/avatar.jpg";
import { OPEN_CHAT_EVENT } from "./ChatWidget";

export default function AskCard() {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event(OPEN_CHAT_EVENT))}
      className="group w-full flex items-center gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/60 px-5 py-4 text-left transition hover:border-zinc-500 hover:bg-zinc-900"
    >
      <span className="relative shrink-0">
        <Image
          src={avatar}
          alt=""
          width={48}
          height={48}
          className="size-12 rounded-full ring-2 ring-zinc-700"
        />
        <span className="absolute bottom-0 right-0 flex size-3">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex size-3 rounded-full bg-emerald-400 ring-2 ring-zinc-900" />
        </span>
      </span>
      <span className="flex-1">
        <span className="block font-semibold">Ask my AI anything</span>
        <span className="block text-sm text-zinc-400">
          Career, projects, or what I&apos;m building now.
        </span>
      </span>
      <span
        aria-hidden
        className="text-xl text-zinc-400 transition group-hover:translate-x-1 group-hover:text-zinc-100"
      >
        →
      </span>
    </button>
  );
}
