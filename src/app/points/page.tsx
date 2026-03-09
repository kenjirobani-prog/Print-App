"use client";

import Link from "next/link";
import { usePoints } from "@/contexts/PointsContext";
import { getResults } from "@/lib/storage";
import { useEffect, useState } from "react";
import type { CheckResult } from "@/lib/storage";

export default function PointsPage() {
  const { points } = usePoints();
  const [results, setResults] = useState<CheckResult[]>([]);

  useEffect(() => {
    setResults(getResults());
  }, []);

  const totalCorrect = results.reduce((sum, r) => sum + r.correctCount, 0);
  const totalProblems = results.reduce((sum, r) => sum + r.totalCount, 0);

  return (
    <div className="py-8 space-y-6">
      <Link href="/" className="text-amber-600 hover:underline text-sm">
        ← もどる
      </Link>
      <h1 className="text-2xl font-bold text-amber-800">ポイント</h1>

      {/* Points display */}
      <div className="bg-gradient-to-br from-amber-400 to-yellow-500 rounded-2xl p-6 text-white text-center shadow-lg">
        <p className="text-sm opacity-80">いまのポイント</p>
        <p className="text-5xl font-bold my-2">{points}</p>
        <p className="text-sm opacity-80">ポイント</p>
        {points > 0 && (
          <Link
            href="/exchange"
            className="inline-block mt-3 bg-white text-amber-600 font-bold py-2 px-6 rounded-full text-sm hover:bg-amber-50 transition-colors"
          >
            ひきかえけんにかえる →
          </Link>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard label="チェックしたプリント" value={`${results.length}まい`} />
        <StatCard label="せいかいした もんだい" value={`${totalCorrect}もん`} />
        <StatCard
          label="せいかいりつ"
          value={
            totalProblems > 0
              ? `${Math.round((totalCorrect / totalProblems) * 100)}%`
              : "---"
          }
        />
        <StatCard
          label="つかえるきんがく"
          value={`${points}円ぶん`}
        />
      </div>

      {/* History */}
      {results.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-gray-700">りれき</h2>
          {[...results].reverse().map((r, i) => (
            <div
              key={i}
              className="bg-white rounded-xl p-4 shadow-sm flex items-center justify-between"
            >
              <div>
                <p className="text-xs font-mono text-gray-400">{r.sheetId}</p>
                <p className="text-sm text-gray-600">
                  {r.correctCount}/{r.totalCount} せいかい
                </p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-amber-600">
                  +{r.pointsEarned} pt
                </p>
                <p className="text-xs text-gray-400">
                  {new Date(r.checkedAt).toLocaleDateString("ja-JP")}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm text-center">
      <p className="text-2xl font-bold text-gray-800">{value}</p>
      <p className="text-xs text-gray-500 mt-1">{label}</p>
    </div>
  );
}
