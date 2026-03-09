export type ProblemType = "kuku" | "english" | "tashizan";

export interface Problem {
  id: number;
  question: string;
  answer: string;
  type: ProblemType;
  choices?: string[];
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

function generateWrongSpellings(correct: string): string[] {
  const wrongs: Set<string> = new Set();
  const vowels = "aeiou";
  const consonants = "bcdfghjklmnpqrstvwxyz";

  // Swap a vowel
  for (let i = 0; i < correct.length; i++) {
    if (vowels.includes(correct[i])) {
      for (const v of vowels) {
        if (v !== correct[i]) {
          const w = correct.slice(0, i) + v + correct.slice(i + 1);
          if (w !== correct) wrongs.add(w);
        }
      }
    }
  }

  // Swap a consonant
  for (let i = 0; i < correct.length; i++) {
    if (consonants.includes(correct[i])) {
      const similar: Record<string, string[]> = {
        b: ["d", "p"],
        c: ["k", "s"],
        d: ["b", "t"],
        f: ["v", "ph"],
        g: ["j", "k"],
        h: [""],
        j: ["g"],
        k: ["c", "q"],
        l: ["r"],
        m: ["n"],
        n: ["m"],
        p: ["b"],
        q: ["k"],
        r: ["l"],
        s: ["c", "z"],
        t: ["d"],
        v: ["f", "b"],
        w: ["v"],
        x: ["ks"],
        y: ["i"],
        z: ["s"],
      };
      const sims = similar[correct[i]] || [];
      for (const s of sims) {
        const w = correct.slice(0, i) + s + correct.slice(i + 1);
        if (w !== correct && w.length > 0) wrongs.add(w);
      }
    }
  }

  // Double a letter
  if (correct.length >= 3) {
    const idx = Math.floor(correct.length / 2);
    const w = correct.slice(0, idx) + correct[idx] + correct.slice(idx);
    if (w !== correct) wrongs.add(w);
  }

  // Remove a letter
  if (correct.length >= 3) {
    const idx = Math.floor(correct.length / 2);
    const w = correct.slice(0, idx) + correct.slice(idx + 1);
    if (w !== correct) wrongs.add(w);
  }

  return shuffleArray([...wrongs]);
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
      question: `${a} × ${b} =`,
      answer: String(a * b),
      type: "kuku",
    });
  });

  return problems;
}

export function generateTashizanProblems(count: number = 10): Problem[] {
  const problems: Problem[] = [];

  for (let i = 0; i < count; i++) {
    // 4桁の足し算: 1000〜9999 の数同士
    const a = Math.floor(Math.random() * 9000) + 1000;
    const b = Math.floor(Math.random() * 9000) + 1000;
    problems.push({
      id: i + 1,
      question: `${a} + ${b} =`,
      answer: String(a + b),
      type: "tashizan",
    });
  }

  return problems;
}

export function generateEnglishProblems(count: number = 10): Problem[] {
  const selected = shuffleArray(ENGLISH_WORDS).slice(0, count);

  return selected.map((item, index) => {
    const wrongOptions = generateWrongSpellings(item.word).slice(0, 3);
    // Ensure we have exactly 3 wrong options
    while (wrongOptions.length < 3) {
      // Pick a random other word as fallback
      const other = ENGLISH_WORDS.find(
        (w) => w.word !== item.word && !wrongOptions.includes(w.word)
      );
      if (other) wrongOptions.push(other.word);
      else break;
    }

    const choices = shuffleArray([item.word, ...wrongOptions.slice(0, 3)]);

    return {
      id: index + 1,
      question: `「${item.hint}」をえいごでえらぼう`,
      answer: item.word,
      type: "english" as ProblemType,
      choices,
    };
  });
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
      : type === "tashizan"
        ? generateTashizanProblems(count)
        : generateEnglishProblems(count);

  return {
    id: generateSheetId(),
    problems,
    createdAt: new Date().toISOString(),
    type,
  };
}
