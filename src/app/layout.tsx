import type { Metadata, Viewport } from "next";
import { Barlow } from "next/font/google";
import "./globals.css";
import { PushInit } from "@/components/PushInit";
import { OrientationGuard } from "@/components/OrientationGuard";

// Body/números = Google Sans (self-hosted via @font-face em globals.css). Barlow = display.
const barlow = Barlow({
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
    <html lang="pt-BR" className={`${barlow.variable}`}>
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
        <OrientationGuard />
      </body>
    </html>
  );
}
