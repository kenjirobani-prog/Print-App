import type { Metadata } from "next";
import "./globals.css";
import { PointsProvider } from "@/contexts/PointsContext";
import { Header } from "@/components/Header";

export const metadata: Metadata = {
  title: "まなびプリント",
  description: "楽しく学べるプリント学習アプリ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="antialiased">
        <PointsProvider>
          <Header />
          <main className="max-w-2xl mx-auto px-4 pb-8">
            {children}
          </main>
        </PointsProvider>
      </body>
    </html>
  );
}
