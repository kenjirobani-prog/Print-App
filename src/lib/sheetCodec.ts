import { PrintSheet, Problem, ProblemType } from "./problems";

/**
 * Encodes a PrintSheet into a compact string for embedding in QR codes.
 * Format: compact JSON → UTF-8 bytes → base64url
 */

interface CompactSheet {
  i: string; // id
  t: string; // type: "k" | "t" | "e"
  p: CompactProblem[];
}

// kuku/tashizan: [num1, num2]
// english: [hint, answer, choice1, choice2, choice3, choice4]
type CompactProblem = [number, number] | [string, string, ...string[]];

const TYPE_MAP: Record<ProblemType, string> = {
  kuku: "k",
  tashizan: "t",
  english: "e",
};

const TYPE_REVERSE: Record<string, ProblemType> = {
  k: "kuku",
  t: "tashizan",
  e: "english",
};

export function encodeSheet(sheet: PrintSheet): string {
  const compact: CompactSheet = {
    i: sheet.id,
    t: TYPE_MAP[sheet.type],
    p: sheet.problems.map((p) => {
      if (sheet.type === "kuku") {
        const match = p.question.match(/(\d+)\s*×\s*(\d+)/);
        return [Number(match![1]), Number(match![2])];
      } else if (sheet.type === "tashizan") {
        const match = p.question.match(/(\d+)\s*\+\s*(\d+)/);
        return [Number(match![1]), Number(match![2])];
      } else {
        // english: extract hint from question
        const hintMatch = p.question.match(/「(.+?)」/);
        const hint = hintMatch ? hintMatch[1] : "";
        return [hint, p.answer, ...(p.choices || [])];
      }
    }),
  };

  const json = JSON.stringify(compact);
  // Unicode-safe base64url encoding
  const bytes = new TextEncoder().encode(json);
  const base64 = btoa(String.fromCharCode(...bytes));
  // Make URL-safe
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function decodeSheet(encoded: string): PrintSheet | null {
  try {
    // Restore standard base64
    let base64 = encoded.replace(/-/g, "+").replace(/_/g, "/");
    // Add padding
    while (base64.length % 4) base64 += "=";

    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const json = new TextDecoder().decode(bytes);
    const compact: CompactSheet = JSON.parse(json);

    const type = TYPE_REVERSE[compact.t];
    if (!type) return null;

    const problems: Problem[] = compact.p.map((cp, idx) => {
      if (type === "kuku") {
        const [a, b] = cp as [number, number];
        return {
          id: idx + 1,
          question: `${a} × ${b} =`,
          answer: String(a * b),
          type: "kuku",
        };
      } else if (type === "tashizan") {
        const [a, b] = cp as [number, number];
        return {
          id: idx + 1,
          question: `${a} + ${b} =`,
          answer: String(a + b),
          type: "tashizan",
        };
      } else {
        const [hint, answer, ...choices] = cp as [string, string, ...string[]];
        return {
          id: idx + 1,
          question: `「${hint}」をえいごでえらぼう`,
          answer,
          type: "english",
          choices,
        };
      }
    });

    return {
      id: compact.i,
      problems,
      createdAt: new Date().toISOString(),
      type,
    };
  } catch {
    return null;
  }
}
