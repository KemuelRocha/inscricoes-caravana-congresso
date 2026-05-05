import type { Metadata } from "next";
import { Montserrat, Inter } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  weight: ["400", "600", "700", "800", "900"],
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Congresso de Jovens — Recife 2026",
  description:
    "Inscrições para a Caravana ao Congresso de Jovens em Recife, 3 a 5 de julho. Realização: Supervisão das Campanhas.",
  keywords: ["congresso", "jovens", "recife", "inscrição", "caravana"],
  openGraph: {
    title: "🔥 Congresso de Jovens em Recife 2026",
    description: "Garanta sua vaga na caravana! 3, 4 e 5 de julho em Recife.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={`${montserrat.variable} ${inter.variable}`}>
      <body className="min-h-screen font-body antialiased">{children}</body>
    </html>
  );
}
