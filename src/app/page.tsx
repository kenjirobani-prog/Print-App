"use client";

import Link from "next/link";

export default function Home() {
  return (
    <div className="py-8 space-y-6">

      <div className="grid gap-4">
        <MenuCard
          href="/print"
          icon="📝"
          title="プリントをつくる"
          description="もんだいをつくって、いんさつしよう"
          color="bg-blue-50 border-blue-200 hover:bg-blue-100"
        />
        <MenuCard
          href="/check"
          icon="📷"
          title="こたえあわせ"
          description="プリントのこたえをチェックしよう"
          color="bg-green-50 border-green-200 hover:bg-green-100"
        />
        <MenuCard
          href="/points"
          icon="⭐"
          title="ポイント"
          description="ためたポイントをかくにんしよう"
          color="bg-yellow-50 border-yellow-200 hover:bg-yellow-100"
        />
        <MenuCard
          href="/exchange"
          icon="🎁"
          title="ひきかえけん"
          description="ポイントをひきかえけんにかえよう"
          color="bg-pink-50 border-pink-200 hover:bg-pink-100"
        />
      </div>
    </div>
  );
}

function MenuCard({
  href,
  icon,
  title,
  description,
  color,
}: {
  href: string;
  icon: string;
  title: string;
  description: string;
  color: string;
}) {
  return (
    <Link
      href={href}
      className={`block p-5 rounded-xl border-2 transition-colors ${color}`}
    >
      <div className="flex items-center gap-4">
        <span className="text-4xl">{icon}</span>
        <div>
          <h2 className="text-lg font-bold text-gray-800">{title}</h2>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
      </div>
    </Link>
  );
}
