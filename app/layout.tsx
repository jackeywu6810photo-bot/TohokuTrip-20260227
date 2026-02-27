import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "🌸 東北櫻花之旅",
  description: "仙台・會津若松・白石川・山寺 7天6夜行程",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
