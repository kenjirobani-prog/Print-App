import { PrintSheet } from "./problems";

const SHEETS_KEY = "print-app-sheets";
const POINTS_KEY = "print-app-points";
const RESULTS_KEY = "print-app-results";

export interface CheckResult {
  sheetId: string;
  correctCount: number;
  totalCount: number;
  pointsEarned: number;
  checkedAt: string;
  answers: { problemId: number; userAnswer: string; correct: boolean }[];
}

// --- Sheets ---
export function saveSheet(sheet: PrintSheet) {
  const sheets = getSheets();
  sheets.push(sheet);
  if (typeof window !== "undefined") {
    localStorage.setItem(SHEETS_KEY, JSON.stringify(sheets));
  }
}

export function getSheets(): PrintSheet[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(SHEETS_KEY);
  return data ? JSON.parse(data) : [];
}

export function getSheetById(id: string): PrintSheet | undefined {
  return getSheets().find((s) => s.id === id);
}

// --- Points ---
export function getPoints(): number {
  if (typeof window === "undefined") return 0;
  const data = localStorage.getItem(POINTS_KEY);
  return data ? parseInt(data, 10) : 0;
}

export function addPoints(amount: number): number {
  const current = getPoints();
  const newTotal = current + amount;
  if (typeof window !== "undefined") {
    localStorage.setItem(POINTS_KEY, String(newTotal));
  }
  return newTotal;
}

export function spendPoints(amount: number): boolean {
  const current = getPoints();
  if (current < amount) return false;
  if (typeof window !== "undefined") {
    localStorage.setItem(POINTS_KEY, String(current - amount));
  }
  return true;
}

// --- Results ---
export function saveResult(result: CheckResult) {
  const results = getResults();
  results.push(result);
  if (typeof window !== "undefined") {
    localStorage.setItem(RESULTS_KEY, JSON.stringify(results));
  }
}

export function getResults(): CheckResult[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(RESULTS_KEY);
  return data ? JSON.parse(data) : [];
}

export function isSheetChecked(sheetId: string): boolean {
  return getResults().some((r) => r.sheetId === sheetId);
}
