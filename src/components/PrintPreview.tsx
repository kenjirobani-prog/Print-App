"use client";

import { useEffect, useRef } from "react";
import QRCode from "qrcode";
import { PrintSheet } from "@/lib/problems";
import { encodeSheet } from "@/lib/sheetCodec";

export function PrintPreview({ sheet }: { sheet: PrintSheet }) {
  const qrRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (qrRef.current) {
      const encoded = encodeSheet(sheet);
      const url = `${window.location.origin}/check?d=${encoded}`;
      QRCode.toCanvas(qrRef.current, url, {
        width: 100,
        margin: 1,
      });
    }
  }, [sheet]);

  const typeLabel =
    sheet.type === "kuku"
      ? "九九"
      : sheet.type === "tashizan"
        ? "たしざん"
        : "えいたんご";

  return (
    <div className="bg-white p-8 shadow-lg print:shadow-none print:p-4 max-w-[210mm] mx-auto">
      {/* Header */}
      <div className="flex justify-between items-start border-b-2 border-gray-300 pb-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">湊太郎まなびプリント</h1>
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
      {sheet.type === "tashizan" ? (
        <HissanProblems sheet={sheet} />
      ) : sheet.type === "english" ? (
        <EnglishChoiceProblems sheet={sheet} />
      ) : (
        <DefaultProblems sheet={sheet} />
      )}

      {/* Footer */}
      <div className="mt-8 pt-4 border-t border-gray-200 text-center">
        <p className="text-xs text-gray-400">
          シートID: {sheet.id} ｜ がんばって ぜんもん せいかい めざそう！
        </p>
      </div>
    </div>
  );
}

function DefaultProblems({ sheet }: { sheet: PrintSheet }) {
  return (
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
  );
}

function HissanProblems({ sheet }: { sheet: PrintSheet }) {
  return (
    <div className="grid grid-cols-2 gap-6 sm:grid-cols-3">
      {sheet.problems.map((problem) => {
        // Parse "1234 + 5678 =" format
        const match = problem.question.match(/(\d+)\s*\+\s*(\d+)/);
        if (!match) return null;
        const a = match[1];
        const b = match[2];
        const maxLen = Math.max(a.length, b.length);

        return (
          <div key={problem.id} className="flex flex-col items-center">
            <span className="text-xs font-bold text-amber-700 mb-1">
              ({problem.id})
            </span>
            <div className="font-mono text-xl leading-tight">
              <div className="text-right pr-1">
                {a.padStart(maxLen, "\u00A0")}
              </div>
              <div className="flex items-center">
                <span className="mr-1">+</span>
                <span className="text-right flex-1">
                  {b.padStart(maxLen, "\u00A0")}
                </span>
              </div>
              <div className="border-t-2 border-gray-800 mt-1 pt-1 min-h-[1.5em]"></div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function EnglishChoiceProblems({ sheet }: { sheet: PrintSheet }) {
  return (
    <div className="space-y-5">
      {sheet.problems.map((problem) => (
        <div
          key={problem.id}
          className="py-2 border-b border-gray-100"
        >
          <div className="flex items-center gap-3 mb-2">
            <span className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center text-sm font-bold text-amber-700 flex-shrink-0">
              {problem.id}
            </span>
            <span className="text-lg font-medium">{problem.question}</span>
          </div>
          {problem.choices && (
            <div className="grid grid-cols-2 gap-2 ml-11">
              {problem.choices.map((choice, idx) => (
                <div
                  key={choice}
                  className="flex items-center gap-2 text-sm"
                >
                  <span className="w-6 h-6 border-2 border-gray-300 rounded flex items-center justify-center text-xs font-bold text-gray-500">
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span>{choice}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
