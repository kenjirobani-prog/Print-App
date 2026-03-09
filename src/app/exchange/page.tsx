"use client";

import { useState } from "react";
import Link from "next/link";
import { usePoints } from "@/contexts/PointsContext";

interface ExchangeItem {
  id: string;
  name: string;
  icon: string;
  description: string;
}

const EXCHANGE_ITEMS: ExchangeItem[] = [
  {
    id: "pokeca",
    name: "ポケカひきかえけん",
    icon: "🃏",
    description: "1ポイント＝1円ぶん！ポケカをかえるよ",
  },
  {
    id: "okashi",
    name: "おかしひきかえけん",
    icon: "🍬",
    description: "1ポイント＝1円ぶん！すきなおかしをかえるよ",
  },
];

export default function ExchangePage() {
  const { points, spendPoints } = usePoints();
  const [exchanged, setExchanged] = useState<{
    item: ExchangeItem;
    amount: number;
  } | null>(null);
  const [amounts, setAmounts] = useState<Record<string, string>>({});

  const handleExchange = (item: ExchangeItem) => {
    const amount = parseInt(amounts[item.id] || "0", 10);
    if (amount <= 0 || amount > points) return;
    const success = spendPoints(amount);
    if (success) {
      setExchanged({ item, amount });
    }
  };

  if (exchanged) {
    return (
      <div className="py-8 space-y-6 text-center">
        <div className="text-6xl">{exchanged.item.icon}</div>
        <h1 className="text-2xl font-bold text-amber-800">
          ひきかえ かんりょう！
        </h1>
        <div className="bg-white rounded-2xl p-6 shadow-md space-y-2">
          <p className="text-xl font-bold">{exchanged.item.name}</p>
          <p className="text-3xl font-bold text-amber-600">
            {exchanged.amount}円ぶん
          </p>
          <div className="bg-amber-50 rounded-xl p-3 mt-4">
            <p className="text-sm text-amber-700">
              {exchanged.amount}ポイント つかいました
            </p>
            <p className="text-lg font-bold text-amber-600">
              のこり: {points} pt
            </p>
          </div>
        </div>
        <p className="text-sm text-gray-500">
          おうちのひとに みせてね！
        </p>
        <div className="flex gap-3">
          <Link
            href="/"
            className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 rounded-xl text-center transition-colors"
          >
            ホームにもどる
          </Link>
          <button
            onClick={() => {
              setExchanged(null);
              setAmounts({});
            }}
            className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 font-bold py-3 rounded-xl transition-colors"
          >
            もっとひきかえる
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 space-y-6">
      <Link href="/" className="text-amber-600 hover:underline text-sm">
        ← もどる
      </Link>
      <h1 className="text-2xl font-bold text-amber-800">ひきかえけん</h1>
      <p className="text-sm text-gray-500">
        ポイントをつかって、ひきかえけんをゲットしよう！
      </p>

      <div className="bg-amber-50 rounded-xl p-4 text-center">
        <p className="text-sm text-amber-700">いまのポイント</p>
        <p className="text-3xl font-bold text-amber-600">{points} pt</p>
        <p className="text-xs text-gray-500 mt-1">1ポイント ＝ 1円</p>
      </div>

      <div className="space-y-4">
        {EXCHANGE_ITEMS.map((item) => {
          const amount = parseInt(amounts[item.id] || "0", 10);
          const canAfford = amount > 0 && amount <= points;
          return (
            <div
              key={item.id}
              className="bg-white rounded-xl p-4 shadow-sm space-y-3"
            >
              <div className="flex items-center gap-4">
                <span className="text-3xl">{item.icon}</span>
                <div className="flex-1">
                  <p className="font-bold text-gray-800">{item.name}</p>
                  <p className="text-xs text-gray-500">{item.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="1"
                  max={points}
                  value={amounts[item.id] || ""}
                  onChange={(e) =>
                    setAmounts((prev) => ({
                      ...prev,
                      [item.id]: e.target.value,
                    }))
                  }
                  placeholder="ポイントすう"
                  className="flex-1 border-2 border-gray-200 rounded-lg px-3 py-2 text-center font-bold focus:border-amber-400 focus:outline-none"
                />
                <span className="text-sm text-gray-500">pt</span>
                <button
                  onClick={() => handleExchange(item)}
                  disabled={!canAfford}
                  className={`py-2 px-4 rounded-lg text-sm font-bold transition-colors ${
                    canAfford
                      ? "bg-amber-500 hover:bg-amber-600 text-white"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  ひきかえる
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
