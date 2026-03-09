export type ProblemType = "kuku" | "english";

export interface Problem {
  id: number;
  question: string;
  answer: string;
  type: ProblemType;
}

export interface PrintSheet {
  id: string;
  problems: Problem[];
  createdAt: string;
  type: ProblemType;
}

const ENGLISH_WORDS: { word: string; hint: string }[] = [
  { word: "cat", hint: "ねこ" },
  { word: "dog", hint: "いぬ" },
  { word: "fish", hint: "さかな" },
  { word: "bird", hint: "とり" },
  { word: "book", hint: "ほん" },
  { word: "pen", hint: "ペン" },
  { word: "red", hint: "あか" },
  { word: "blue", hint: "あお" },
  { word: "sun", hint: "たいよう" },
  { word: "moon", hint: "つき" },
  { word: "star", hint: "ほし" },
  { word: "tree", hint: "き" },
  { word: "egg", hint: "たまご" },
  { word: "milk", hint: "ぎゅうにゅう" },
  { word: "cake", hint: "ケーキ" },
  { word: "ball", hint: "ボール" },
  { word: "hand", hint: "て" },
  { word: "eye", hint: "め" },
  { word: "ear", hint: "みみ" },
  { word: "nose", hint: "はな" },
  { word: "hat", hint: "ぼうし" },
  { word: "cup", hint: "コップ" },
  { word: "box", hint: "はこ" },
  { word: "bag", hint: "かばん" },
  { word: "apple", hint: "りんご" },
  { word: "orange", hint: "オレンジ" },
  { word: "grape", hint: "ぶどう" },
  { word: "lemon", hint: "レモン" },
  { word: "rain", hint: "あめ" },
  { word: "snow", hint: "ゆき" },
];

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function generateKukuProblems(count: number = 10): Problem[] {
  const problems: Problem[] = [];
  const pairs: [number, number][] = [];

  for (let i = 1; i <= 9; i++) {
    for (let j = 1; j <= 9; j++) {
      pairs.push([i, j]);
    }
  }

  const selected = shuffleArray(pairs).slice(0, count);

  selected.forEach(([a, b], index) => {
    problems.push({
      id: index + 1,
      question: `${a} × ${b} = `,
      answer: String(a * b),
      type: "kuku",
    });
  });

  return problems;
}

export function generateEnglishProblems(count: number = 10): Problem[] {
  const selected = shuffleArray(ENGLISH_WORDS).slice(0, count);

  return selected.map((item, index) => ({
    id: index + 1,
    question: `「${item.hint}」をえいごで書こう → `,
    answer: item.word,
    type: "english" as ProblemType,
  }));
}

export function generateSheetId(): string {
  const now = new Date();
  const datePart = now.toISOString().slice(0, 10).replace(/-/g, "");
  const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${datePart}-${randomPart}`;
}

export function createPrintSheet(
  type: ProblemType,
  count: number = 10
): PrintSheet {
  const problems =
    type === "kuku"
      ? generateKukuProblems(count)
      : generateEnglishProblems(count);

  return {
    id: generateSheetId(),
    problems,
    createdAt: new Date().toISOString(),
    type,
  };
}
