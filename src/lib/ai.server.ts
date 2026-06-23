import { getFallbackResponse } from "./ai.fallback";

// Server-only helper for calling the Lovable AI Gateway via OpenAI-compatible chat completions.
export async function lovableChat(
  messages: { role: "system" | "user" | "assistant"; content: string }[],
  opts: { model?: string; maxTokens?: number } = {},
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("GEMINI_API_KEY is not configured. Using local fallback data.");
    return getFallbackResponse(messages);
  }
  
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/openai/chat/completions`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: opts.model ?? "gemini-2.0-flash", // Default to gemini-2.0-flash
        messages,
        max_tokens: opts.maxTokens ?? 1200,
      }),
    });
    
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.warn(`AI API error (${res.status}): ${text}. Using local fallback data.`);
      return getFallbackResponse(messages);
    }
    
    const j = await res.json();
    return (j.choices?.[0]?.message?.content ?? "") as string;
  } catch (error) {
    console.warn("Failed to reach AI API. Using local fallback data.", error);
    return getFallbackResponse(messages);
  }
}
