import type { Metadata } from "next";
import { displayHeadline } from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Desafio de Palpites do Inca",
  description: "Palpites promocionais de placar para acompanhar os dias de jogo no Inca Bar."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className={displayHeadline.variable}>{children}</body>
    </html>
  );
}
