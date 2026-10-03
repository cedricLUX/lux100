import type { Metadata } from "next";
import { Bricolage_Grotesque, Source_Sans_3 } from "next/font/google";
import "./globals.css";

const body = Source_Sans_3({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-body" });
const display = Bricolage_Grotesque({ subsets: ["latin"], weight: ["500", "700", "800"], variable: "--font-display" });

export const metadata: Metadata = {
  title: "Lëtzebuergesch en 100 jours",
  description: "Apprenez les 400 mots essentiels du luxembourgeois, 4 mots par jour pendant 100 jours.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${body.variable} ${display.variable}`}>
      <body>{children}</body>
    </html>
  );
}
