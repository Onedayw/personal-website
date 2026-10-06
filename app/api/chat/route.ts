const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 10;
const MAX_MESSAGE_CHARS = 2000;

const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const window = (hits.get(ip) ?? []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  if (window.length >= RATE_LIMIT_MAX) return true;
  window.push(now);
  hits.set(ip, window);
  return false;
}

const SYSTEM_PROMPT = `You are the AI assistant on Nate Wang's personal website. \
Nate is a Senior Software Engineer at Meta in Seattle, previously at Microsoft, \
Oracle, and Pocket Gems. His motto is "Don't code. Build." He works on distributed \
systems and cloud infrastructure. Answer visitors' questions about Nate warmly and \
concisely, in first person as his representative. If asked something you can't know, \
say so honestly. Keep answers short — a few sentences unless more detail is asked for.`;

export async function POST(req: Request) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (rateLimited(ip)) {
    return Response.json(
      { error: "Too many requests — wait a minute and try again." },
      { status: 429 }
    );
  }

  let body: { messages?: { role: string; content: string }[] };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  const messages = (body.messages ?? [])
    .filter((m) => m.role === "user" || m.role === "assistant")
    .slice(-10)
    .map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content.slice(0, MAX_MESSAGE_CHARS),
    }));

  if (messages.length === 0) {
    return Response.json({ error: "No message provided." }, { status: 400 });
  }

  const apiKey = process.env.AI_API_KEY;
  if (!apiKey) {
    return Response.json({
      reply:
        "The chat backend isn't wired up to an AI provider yet — but the plumbing works! (Set AI_API_KEY to enable answers.)",
    });
  }

  const baseUrl = (process.env.AI_BASE_URL ?? "https://api.openai.com/v1").replace(
    /\/$/,
    ""
  );
  const model = process.env.AI_MODEL ?? "gpt-4o-mini";

  const upstream = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      stream: true,
      messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
    }),
  });

  if (!upstream.ok || !upstream.body) {
    return Response.json(
      { reply: "The AI provider returned an error — try again in a bit." },
      { status: 502 }
    );
  }

  return new Response(upstream.body, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
