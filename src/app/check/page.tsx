"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { getSheetById } from "@/lib/storage";
import { isSheetChecked, saveResult, type CheckResult } from "@/lib/storage";
import { usePoints } from "@/contexts/PointsContext";
import { PrintSheet } from "@/lib/problems";

export default function CheckPage() {
  const [sheetId, setSheetId] = useState("");
  const [sheet, setSheet] = useState<PrintSheet | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [result, setResult] = useState<CheckResult | null>(null);
  const [error, setError] = useState("");
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrError, setOcrError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addPoints } = usePoints();

  const handleFindSheet = () => {
    setError("");
    const found = getSheetById(sheetId.trim());
    if (!found) {
      setError("このシートIDのプリントがみつかりません");
      return;
    }
    if (isSheetChecked(sheetId.trim())) {
      setError("このプリントはすでにチェックずみです");
      return;
    }
    setSheet(found);
    setAnswers({});
  };

  // OCR from initial screen - finds sheet ID and answers from photo
  const handleOcrCaptureWithSheetLookup = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setOcrLoading(true);
    setOcrError("");
    setError("");

    try {
      const base64 = await fileToBase64(file);
      const res = await fetch("/api/ocr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64 }),
      });

      if (!res.ok) {
        const data = await res.json();
        setOcrError(data.error || "OCRにしっぱいしました");
        return;
      }

      const { text } = await res.json();

      // Try to find sheet ID in OCR text (format: YYYYMMDD-XXXXXX)
      // OCR may misread hyphens as different dash characters or add spaces
      const normalizedText = text.replace(/[–—―ー]/g, "-").replace(/\s+/g, " ");
      const sheetIdMatch = normalizedText.match(/(\d{8})\s*[-]\s*([A-Z0-9]{6})/);
      if (!sheetIdMatch) {
        setOcrError(
          `シートIDがよみとれませんでした。てにゅうりょくしてください。\n（OCR: ${text.substring(0, 100)}）`
        );
        return;
      }

      const foundSheetId = `${sheetIdMatch[1]}-${sheetIdMatch[2]}`;
      const foundSheet = getSheetById(foundSheetId);
      if (!foundSheet) {
        setOcrError(
          `シートID「${foundSheetId}」のプリントがみつかりません。\nプリントをさきにいんさつしてから、しゃしんをとってね。`
        );
        return;
      }

      if (isSheetChecked(foundSheetId)) {
        setOcrError("このプリントはすでにチェックずみです");
        return;
      }

      // Extract answer numbers from OCR text
      // Remove the sheet ID from text first to avoid confusion
      const textWithoutId = text.replace(sheetIdMatch[0], "");
      const numbers = textWithoutId.match(/\d+/g) || [];

      // For kuku/tashizan, map extracted numbers to answers
      const newAnswers: Record<number, string> = {};
      if (foundSheet.type === "kuku" || foundSheet.type === "tashizan") {
        // Filter out numbers that are part of the problems themselves
        const problemNumbers = new Set<string>();
        foundSheet.problems.forEach((p) => {
          const nums = p.question.match(/\d+/g) || [];
          nums.forEach((n) => problemNumbers.add(n));
        });

        const answerNumbers = numbers.filter(
          (n: string) => !problemNumbers.has(n)
        );
        foundSheet.problems.forEach((p, idx) => {
          if (answerNumbers[idx]) {
            newAnswers[p.id] = answerNumbers[idx];
          }
        });
      }

      setSheetId(foundSheetId);
      setSheet(foundSheet);
      setAnswers(newAnswers);
    } catch {
      setOcrError("OCRにしっぱいしました。もういちどためしてください。");
    } finally {
      setOcrLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // OCR from answer entry form (after sheet is found)
  const handleOcrCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !sheet) return;

    setOcrLoading(true);
    setOcrError("");

    try {
      const base64 = await fileToBase64(file);
      const res = await fetch("/api/ocr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64 }),
      });

      if (!res.ok) {
        const data = await res.json();
        setOcrError(data.error || "OCRにしっぱいしました");
        return;
      }

      const { text } = await res.json();
      // Extract numbers from OCR text
      const numbers = text.match(/\d+/g) || [];

      // Map numbers to problems in order
      const newAnswers: Record<number, string> = { ...answers };
      sheet.problems.forEach((p, idx) => {
        if (numbers[idx]) {
          newAnswers[p.id] = numbers[idx];
        }
      });
      setAnswers(newAnswers);
    } catch {
      setOcrError("OCRにしっぱいしました。もういちどためしてください。");
    } finally {
      setOcrLoading(false);
      // Reset file input
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleCheck = () => {
    if (!sheet) return;

    const resultAnswers = sheet.problems.map((p) => {
      const userAnswer = (answers[p.id] || "").trim().toLowerCase();
      const correct = userAnswer === p.answer.toLowerCase();
      return {
        problemId: p.id,
        userAnswer,
        correct,
      };
    });

    const correctCount = resultAnswers.filter((a) => a.correct).length;
    const pointsEarned = correctCount;

    const checkResult: CheckResult = {
      sheetId: sheet.id,
      correctCount,
      totalCount: sheet.problems.length,
      pointsEarned,
      checkedAt: new Date().toISOString(),
      answers: resultAnswers,
    };

    saveResult(checkResult);
    addPoints(pointsEarned);
    setResult(checkResult);
  };

  // Show results
  if (result) {
    const perfect = result.correctCount === result.totalCount;
    return (
      <div className="py-8 space-y-6">
        <div className="text-center space-y-4">
          <div className="text-6xl">{perfect ? "🎉" : "💪"}</div>
          <h1 className="text-2xl font-bold text-amber-800">
            {perfect ? "ぜんもん せいかい！" : "おつかれさま！"}
          </h1>
          <div className="bg-white rounded-2xl p-6 shadow-md space-y-3">
            <p className="text-4xl font-bold text-amber-600">
              {result.correctCount} / {result.totalCount}
            </p>
            <p className="text-sm text-gray-500">せいかいすう</p>
            <div className="bg-yellow-50 rounded-xl p-4">
              <p className="text-2xl font-bold text-yellow-600">
                +{result.pointsEarned} pt
              </p>
              <p className="text-xs text-gray-400">ゲットしたポイント</p>
            </div>
          </div>
        </div>

        {/* Detailed results */}
        <div className="space-y-2">
          {sheet?.problems.map((p) => {
            const ans = result.answers.find((a) => a.problemId === p.id);
            return (
              <div
                key={p.id}
                className={`flex items-center gap-3 p-3 rounded-lg ${
                  ans?.correct ? "bg-green-50" : "bg-red-50"
                }`}
              >
                <span className="text-xl">{ans?.correct ? "⭕" : "❌"}</span>
                <span className="flex-1 text-sm">{p.question}</span>
                {!ans?.correct && (
                  <span className="text-sm text-red-500">
                    こたえ: {p.answer}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex gap-3">
          <Link
            href="/"
            className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 rounded-xl text-center transition-colors"
          >
            ホームにもどる
          </Link>
          <Link
            href="/print"
            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-xl text-center transition-colors"
          >
            つぎのプリント
          </Link>
        </div>
      </div>
    );
  }

  // Answer entry form
  if (sheet) {
    const isEnglish = sheet.type === "english";
    const isKukuOrTashizan =
      sheet.type === "kuku" || sheet.type === "tashizan";
    const typeLabel =
      sheet.type === "kuku"
        ? "九九"
        : sheet.type === "tashizan"
          ? "たしざん"
          : "えいたんご";

    return (
      <div className="py-8 space-y-6">
        <Link
          href="/"
          className="text-amber-600 hover:underline text-sm"
        >
          ← もどる
        </Link>
        <h1 className="text-2xl font-bold text-amber-800">こたえあわせ</h1>
        <p className="text-sm text-gray-500">
          シートID: {sheet.id} ／ {typeLabel}
        </p>

        {/* OCR capture button for kuku/tashizan */}
        {isKukuOrTashizan && (
          <div className="space-y-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={ocrLoading}
              className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-bold py-3 px-6 rounded-xl text-lg transition-colors shadow-md flex items-center justify-center gap-2"
            >
              <span className="text-2xl">📷</span>
              {ocrLoading ? "よみとりちゅう..." : "しゃしんでこたえあわせ"}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleOcrCapture}
              className="hidden"
            />
            {ocrError && (
              <p className="text-red-500 text-sm text-center">{ocrError}</p>
            )}
            <p className="text-xs text-gray-400 text-center">
              プリントのこたえを写真にとると、じどうでにゅうりょくされます
            </p>
            <div className="border-t border-gray-200 pt-3">
              <p className="text-xs text-gray-400 text-center">
                または、てにゅうりょく ↓
              </p>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {sheet.problems.map((p) =>
            isEnglish && p.choices ? (
              <div
                key={p.id}
                className="bg-white p-4 rounded-xl shadow-sm space-y-3"
              >
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center text-sm font-bold text-amber-700 flex-shrink-0">
                    {p.id}
                  </span>
                  <span className="flex-1 text-sm font-bold">{p.question}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {p.choices.map((choice) => (
                    <button
                      key={choice}
                      onClick={() =>
                        setAnswers((prev) => ({ ...prev, [p.id]: choice }))
                      }
                      className={`py-2 px-3 rounded-lg text-sm font-bold border-2 transition-colors ${
                        answers[p.id] === choice
                          ? "bg-amber-500 text-white border-amber-500"
                          : "bg-white text-gray-700 border-gray-200 hover:border-amber-300"
                      }`}
                    >
                      {choice}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div
                key={p.id}
                className="flex items-center gap-3 bg-white p-3 rounded-xl shadow-sm"
              >
                <span className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center text-sm font-bold text-amber-700 flex-shrink-0">
                  {p.id}
                </span>
                <span className="flex-1 text-sm">{p.question}</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={answers[p.id] || ""}
                  onChange={(e) =>
                    setAnswers((prev) => ({
                      ...prev,
                      [p.id]: e.target.value,
                    }))
                  }
                  className="w-32 border-2 border-gray-200 rounded-lg px-3 py-2 text-center font-bold focus:border-amber-400 focus:outline-none"
                  placeholder="こたえ"
                />
              </div>
            )
          )}
        </div>

        <button
          onClick={handleCheck}
          className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-xl text-lg transition-colors shadow-md"
        >
          こたえあわせする！
        </button>
      </div>
    );
  }

  // Sheet ID input
  return (
    <div className="py-8 space-y-6">
      <Link href="/" className="text-amber-600 hover:underline text-sm">
        ← もどる
      </Link>
      <h1 className="text-2xl font-bold text-amber-800">こたえあわせ</h1>

      {/* OCR capture - always visible on initial screen */}
      <div className="space-y-2">
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={ocrLoading}
          className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-bold py-4 px-6 rounded-xl text-lg transition-colors shadow-md flex items-center justify-center gap-2"
        >
          <span className="text-2xl">📷</span>
          {ocrLoading ? "よみとりちゅう..." : "しゃしんでこたえあわせ"}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleOcrCaptureWithSheetLookup}
          className="hidden"
        />
        {ocrError && (
          <p className="text-red-500 text-sm text-center">{ocrError}</p>
        )}
        <p className="text-xs text-gray-400 text-center">
          プリントぜんたいを写真にとってね
        </p>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex-1 border-t border-gray-200"></div>
        <span className="text-xs text-gray-400">または</span>
        <div className="flex-1 border-t border-gray-200"></div>
      </div>

      <div className="space-y-4">
        <p className="text-sm text-gray-500">
          シートIDをにゅうりょくしてさがす
        </p>
        <input
          type="text"
          value={sheetId}
          onChange={(e) => setSheetId(e.target.value)}
          placeholder="シートID（れい: 20260309-ABC123）"
          className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-center font-mono text-lg focus:border-amber-400 focus:outline-none"
        />
        {error && (
          <p className="text-red-500 text-sm text-center">{error}</p>
        )}
        <button
          onClick={handleFindSheet}
          className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-xl text-lg transition-colors shadow-md"
        >
          プリントをさがす
        </button>
      </div>
    </div>
  );
}
