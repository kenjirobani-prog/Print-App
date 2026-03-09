"use client";

import { useState } from "react";
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
    const pointsEarned = correctCount; // 1問正解 = 1ポイント

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
          シートID: {sheet.id} ／{" "}
          {sheet.type === "kuku" ? "九九" : "えいたんご"}
        </p>

        <div className="space-y-3">
          {sheet.problems.map((p) => (
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
                value={answers[p.id] || ""}
                onChange={(e) =>
                  setAnswers((prev) => ({ ...prev, [p.id]: e.target.value }))
                }
                className="w-32 border-2 border-gray-200 rounded-lg px-3 py-2 text-center font-bold focus:border-amber-400 focus:outline-none"
                placeholder="こたえ"
              />
            </div>
          ))}
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
      <p className="text-sm text-gray-500">
        プリントのシートIDをにゅうりょくしてください
      </p>

      <div className="space-y-4">
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

      <div className="bg-blue-50 rounded-xl p-4 space-y-2">
        <p className="text-sm font-bold text-blue-800">つかいかた</p>
        <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
          <li>プリントの右上にあるシートIDをにゅうりょく</li>
          <li>えんぴつで書いたこたえをそのままにゅうりょく</li>
          <li>「こたえあわせする！」をおす</li>
        </ol>
      </div>
    </div>
  );
}
