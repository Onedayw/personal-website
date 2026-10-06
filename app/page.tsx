import Image from "next/image";
import ChatWidget from "../components/ChatWidget";
import portrait from "../public/nate.jpg";

export default function Home() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center px-6 py-24 text-center">
      <div className="relative mb-10">
        <div
          aria-hidden
          className="absolute -inset-6 rounded-full bg-gradient-to-tr from-zinc-500/25 via-zinc-200/10 to-transparent blur-2xl"
        />
        <div className="relative rounded-full p-[6px] bg-gradient-to-tr from-zinc-500 via-zinc-100 to-zinc-500 shadow-2xl shadow-black/60">
          <Image
            src={portrait}
            alt="Nate Wang"
            width={176}
            height={176}
            placeholder="blur"
            loading="eager"
            fetchPriority="high"
            className="size-36 sm:size-44 rounded-full object-cover ring-[3px] ring-background"
          />
        </div>
      </div>
      <p className="text-sm uppercase tracking-[0.3em] text-zinc-400 mb-6">
        Seattle, WA
      </p>
      <h1 className="text-5xl sm:text-7xl font-bold tracking-tight mb-6">
        Nate Wang
      </h1>
      <p className="text-xl sm:text-2xl text-zinc-300 mb-4">
        Don&apos;t code. <span className="text-white font-semibold">Build.</span>
      </p>
      <p className="max-w-xl text-zinc-400 leading-relaxed mb-10">
        Senior Software Engineer at Meta. Previously Microsoft, Oracle, and
        Pocket Gems. I build distributed systems, cloud infrastructure, and
        the occasional thing just for fun.
      </p>
      <div className="flex gap-4 mb-16">
        <a
          href="https://github.com/Onedayw"
          target="_blank"
          rel="noopener noreferrer"
          className="px-6 py-3 rounded-full bg-white text-black font-medium hover:bg-zinc-200 transition-colors"
        >
          GitHub
        </a>
        <a
          href="https://www.linkedin.com/in/onedayw/"
          target="_blank"
          rel="noopener noreferrer"
          className="px-6 py-3 rounded-full border border-zinc-500 text-zinc-100 font-medium hover:border-zinc-300 transition-colors"
        >
          LinkedIn
        </a>
      </div>

      <section className="max-w-2xl w-full text-left border-t border-zinc-800 pt-10">
        <h2 className="text-lg font-semibold mb-3">Ask me anything</h2>
        <p className="text-zinc-400 text-sm leading-relaxed">
          There&apos;s a chat widget in the corner — ask it about my background,
          what I&apos;m working on, or anything else. It&apos;ll answer on my
          behalf.
        </p>
      </section>

      <ChatWidget />
    </main>
  );
}
