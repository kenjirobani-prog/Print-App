"use client";

import Link from "next/link";
import { usePoints } from "@/contexts/PointsContext";

export function Header() {
  return (
    <header className="no-print bg-amber-500 text-white shadow-md">
      <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold tracking-tight">
          まなびプリント
        </Link>
        <PointsBadge />
      </div>
    </header>
  );
}

function PointsBadge() {
  const { points } = usePoints();
  return (
    <Link
      href="/points"
      className="bg-amber-600 hover:bg-amber-700 transition-colors rounded-full px-4 py-1.5 text-sm font-bold flex items-center gap-1.5"
    >
      <span className="text-yellow-200 text-base">★</span>
      <span>{points} pt</span>
    </Link>
  );
}
