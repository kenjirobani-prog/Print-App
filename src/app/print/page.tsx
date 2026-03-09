"use client";

import { useState } from "react";
import Link from "next/link";
import { ProblemType, createPrintSheet, PrintSheet } from "@/lib/problems";
import { saveSheet } from "@/lib/storage";
import { PrintPreview } from "@/components/PrintPreview";

export default function PrintPage() {
  const [type, setType] = useState<ProblemType>("kuku");
  const [count, setCount] = useState(10);
  const [sheet, setSheet] = useState<PrintSheet | null>(null);

  const handleGenerate = () => {
    const newSheet = createPrintSheet(type, count);
    saveSheet(newSheet);
    setSheet(newSheet);
  };

  const handlePrint = () => {
    window.print();
  };

  if (sheet) {
    return (
      <div>
        <div className="no-print py-4 flex gap-3">
          <button
            onClick={handlePrint}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-lg transition-colors"
          >
            いんさつする
          </button>
          <button
            onClick={() => setSheet(null)}
            className="bg-gray-300 hover:bg-gray-400 text-gray-700 font-bold py-2 px-6 rounded-lg transition-colors"
          >
            もどる
          </button>
        </div>
        <PrintPreview sheet={sheet} />
      </div>
    );
  }

  return (
    <div className="py-8 space-y-6">
      <Link href="/" className="text-amber-600 hover:underline text-sm">
        ← もどる
      </Link>
      <h1 className="text-2xl font-bold text-amber-800">プリントをつくる</h1>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            もんだいのしゅるい
          </label>
          <div className="flex gap-3">
            <TypeButton
              selected={type === "kuku"}
              onClick={() => setType("kuku")}
              label="九九（かけざん）"
            />
            <TypeButton
              selected={type === "english"}
              onClick={() => setType("english")}
              label="えいたんご"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            もんだいのかず
          </label>
          <div className="flex gap-2">
            {[5, 10, 15, 20].map((n) => (
              <button
                key={n}
                onClick={() => setCount(n)}
                className={`px-4 py-2 rounded-lg font-bold transition-colors ${
                  count === n
                    ? "bg-amber-500 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {n}もん
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleGenerate}
          className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 px-6 rounded-xl text-lg transition-colors shadow-md"
        >
          プリントをつくる！
        </button>
      </div>
    </div>
  );
}

function TypeButton({
  selected,
  onClick,
  label,
}: {
  selected: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 py-3 px-4 rounded-xl font-bold transition-colors border-2 ${
        selected
          ? "bg-amber-500 text-white border-amber-500"
          : "bg-white text-gray-600 border-gray-200 hover:border-amber-300"
      }`}
    >
      {label}
    </button>
  );
}
