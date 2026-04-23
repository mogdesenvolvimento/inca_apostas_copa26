import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bolão Recreativo Copa 2026",
  description: "Palpites promocionais de placar, sem vínculo financeiro."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
