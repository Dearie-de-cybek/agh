/**
 * Demo preview data. Used ONLY when the live model service can't be reached
 * from the current host, so the interface can still be reviewed. Everything
 * here is clearly labelled "Demo" in the UI; replies are scripted sample text,
 * never presented as real model output.
 */
import type { ModelInfo } from "./api";

export const DEMO_MODELS: ModelInfo[] = [
  {
    id: "demo-sunflower",
    name: "Sunflower 14B (Uganda)",
    description: "Sample model card.",
    specialties: ["African languages", "Translation", "Ugandan languages"],
    notIdealFor: "General chat or non-African languages (like Spanish or Arabic)",
    starterPrompts: [
      "Translate 'Welcome to the future of African AI' into Luganda",
      "Translate 'The clinic opens at 8am on Monday' into Swahili",
      "How do you politely greet an elder in Acholi?",
    ],
    contextLength: 32768,
    pricing: { inputPerMTokens: "3.0000", outputPerMTokens: "3.0000" },
    isFree: false,
    available: true,
  },
  {
    id: "demo-natlas",
    name: "N-ATLaS 8B (Nigeria)",
    description: "Sample model card.",
    specialties: ["African languages", "Hausa", "Igbo", "Yoruba", "Nigerian English", "Translation"],
    notIdealFor: "Heavy coding and long mathematical reasoning",
    starterPrompts: [
      "Translate this to Yoruba: Welcome to our clinic, please have a seat",
      "Fi Hausa amsa: Yaya zan bude asusun banki a Najeriya?",
      "Explain what NIN registration is and why it matters, in simple Nigerian English",
    ],
    contextLength: 8192,
    pricing: { inputPerMTokens: "0.3000", outputPerMTokens: "0.3000" },
    isFree: false,
    available: true,
  },
];

export const DEMO_LIMIT = 5;

/** Streams a scripted sample reply word by word so the loading/streaming states are visible. */
export async function streamDemoReply(model: string, question: string, onDelta: (t: string) => void): Promise<string> {
  const text =
    `Demo preview — this is sample text, not a live answer from ${model}.\n\n` +
    `You asked: “${question.length > 140 ? question.slice(0, 140) + "…" : question}”\n\n` +
    `When the live service is reachable, ${model} will answer here, streamed from GPUs AGH operates.`;
  await new Promise((r) => setTimeout(r, 700)); // "thinking"
  let out = "";
  for (const w of text.split(/(\s+)/)) {
    out += w;
    onDelta(out);
    await new Promise((r) => setTimeout(r, 28));
  }
  return out;
}
