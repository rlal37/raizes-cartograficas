import type { Metadata } from "next";
import { Bricolage_Grotesque, Mulish } from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav";

const display = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["400", "600", "800"],
  variable: "--font-display",
  display: "swap",
});

const body = Mulish({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Raízes Cartográficas",
  description: "Um rizoma de saberes populares — não um acervo.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={`${display.variable} ${body.variable}`}>
      <body>
        <Nav />
        {children}
      </body>
    </html>
  );
}