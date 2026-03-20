"use client";

import Link from "next/link";
import Image from "next/image";
import { usePoints } from "@/contexts/PointsContext";

export function Header() {
  return (
    <header className="no-print shadow-md">
      <Link href="/" className="block">
        <Image
          src="/top-banner.png"
          alt="まなびプリント"
          width={1200}
          height={200}
          className="w-full h-auto"
          priority
        />
      </Link>
      <div className="bg-amber-500 px-4 py-1.5 flex justify-end max-w-2xl mx-auto">
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
