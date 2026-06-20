import type { Metadata, Viewport } from "next";
import { Inter, Barlow_Condensed } from "next/font/google";
import "./globals.css";
import { PushInit } from "@/components/PushInit";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const barlowCondensed = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800", "900"],
  variable: "--font-barlow",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Canelada — O baba virou resenha.",
  description: "Feed social pós-baba. Vote no MVP, colecione traits, compartilhe a resenha.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${barlowCondensed.variable}`}>
      <body>
        <div
          id="app-shell"
          style={{
            maxWidth: "430px",
            marginInline: "auto",
            minHeight: "100dvh",
            background: "var(--color-bg)",
            position: "relative",
            paddingTop: "env(safe-area-inset-top, 0px)",
          }}
        >
          <PushInit />
          {children}
        </div>
      </body>
    </html>
  );
}
