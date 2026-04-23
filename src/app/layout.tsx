import type { Metadata } from "next";
import { displayHeadline } from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Copa 2026 no Inca",
  description: "Palpites promocionais de placar para entrar no clima da Copa no Inca Bar."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className={displayHeadline.variable}>{children}</body>
    </html>
  );
}
