"use client";

import { useState } from "react";
import Link from "next/link";
import { usePoints } from "@/contexts/PointsContext";

interface ExchangeItem {
  id: string;
  name: string;
  icon: string;
  cost: number;
  description: string;
}

const EXCHANGE_ITEMS: ExchangeItem[] = [
  {
    id: "snack",
    name: "おやつえらべるけん",
    icon: "🍪",
    cost: 100,
    description: "すきなおやつを1つえらべるよ",
  },
  {
    id: "game30",
    name: "ゲーム30ぷんけん",
    icon: "🎮",
    cost: 150,
    description: "ゲームを30ぷんあそべるよ",
  },
  {
    id: "game60",
    name: "ゲーム60ぷんけん",
    icon: "🕹️",
    cost: 250,
    description: "ゲームを60ぷんあそべるよ",
  },
  {
    id: "outing",
    name: "おでかけけん",
    icon: "🏞️",
    cost: 500,
    description: "いきたいところにおでかけできるよ",
  },
];

export default function ExchangePage() {
  const { points, spendPoints } = usePoints();
  const [exchanged, setExchanged] = useState<ExchangeItem | null>(null);

  const handleExchange = (item: ExchangeItem) => {
    if (points < item.cost) return;
    const success = spendPoints(item.cost);
    if (success) {
      setExchanged(item);
    }
  };

  if (exchanged) {
    return (
      <div className="py-8 space-y-6 text-center">
        <div className="text-6xl">{exchanged.icon}</div>
        <h1 className="text-2xl font-bold text-amber-800">
          ひきかえ かんりょう！
        </h1>
        <div className="bg-white rounded-2xl p-6 shadow-md space-y-2">
          <p className="text-xl font-bold">{exchanged.name}</p>
          <p className="text-sm text-gray-500">{exchanged.description}</p>
          <div className="bg-amber-50 rounded-xl p-3 mt-4">
            <p className="text-sm text-amber-700">
              {exchanged.cost}ポイント つかいました
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
            onClick={() => setExchanged(null)}
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
      </div>

      <div className="space-y-3">
        {EXCHANGE_ITEMS.map((item) => {
          const canAfford = points >= item.cost;
          return (
            <div
              key={item.id}
              className={`bg-white rounded-xl p-4 shadow-sm flex items-center gap-4 ${
                !canAfford ? "opacity-50" : ""
              }`}
            >
              <span className="text-3xl">{item.icon}</span>
              <div className="flex-1">
                <p className="font-bold text-gray-800">{item.name}</p>
                <p className="text-xs text-gray-500">{item.description}</p>
              </div>
              <button
                onClick={() => handleExchange(item)}
                disabled={!canAfford}
                className={`py-2 px-4 rounded-lg text-sm font-bold transition-colors ${
                  canAfford
                    ? "bg-amber-500 hover:bg-amber-600 text-white"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
              >
                {item.cost} pt
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
