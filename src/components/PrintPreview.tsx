"use client";

import { useEffect, useRef } from "react";
import QRCode from "qrcode";
import { PrintSheet } from "@/lib/problems";

export function PrintPreview({ sheet }: { sheet: PrintSheet }) {
  const qrRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (qrRef.current) {
      QRCode.toCanvas(qrRef.current, sheet.id, {
        width: 100,
        margin: 1,
      });
    }
  }, [sheet.id]);

  const typeLabel = sheet.type === "kuku" ? "九九" : "えいたんご";

  return (
    <div className="bg-white p-8 shadow-lg print:shadow-none print:p-4 max-w-[210mm] mx-auto">
      {/* Header */}
      <div className="flex justify-between items-start border-b-2 border-gray-300 pb-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">まなびプリント</h1>
          <p className="text-sm text-gray-500 mt-1">
            {typeLabel} ／ {sheet.problems.length}もん
          </p>
        </div>
        <div className="text-right flex flex-col items-end">
          <canvas ref={qrRef} className="mb-1" />
          <p className="text-xs text-gray-400 font-mono">{sheet.id}</p>
        </div>
      </div>

      {/* Name field */}
      <div className="mb-6 flex items-center gap-2">
        <span className="text-sm font-bold text-gray-600">なまえ：</span>
        <div className="flex-1 border-b-2 border-gray-300 min-h-[2em]"></div>
        <span className="text-sm font-bold text-gray-600 ml-4">ひづけ：</span>
        <div className="w-40 border-b-2 border-gray-300 min-h-[2em]"></div>
      </div>

      {/* Problems */}
      <div className="space-y-4">
        {sheet.problems.map((problem) => (
          <div
            key={problem.id}
            className="flex items-center gap-3 py-2 border-b border-gray-100"
          >
            <span className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center text-sm font-bold text-amber-700 flex-shrink-0">
              {problem.id}
            </span>
            <span className="text-lg font-medium flex-1">
              {problem.question}
            </span>
            <div className="w-40 border-b-2 border-dashed border-gray-300 min-h-[2em]"></div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-8 pt-4 border-t border-gray-200 text-center">
        <p className="text-xs text-gray-400">
          シートID: {sheet.id} ｜ がんばって ぜんもん せいかい めざそう！
        </p>
      </div>
    </div>
  );
}
