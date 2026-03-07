import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Rajdhani } from "next/font/google";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { CardsProvider } from "@/lib/cards/cards-provider";
import { AuthProvider } from "@/lib/auth";
import { MigrationBanner } from "@/components/auth/migration-banner";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

const rajdhani = Rajdhani({
  variable: "--font-display",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "ripperdeck — Cyberpunk 2077 TCG Deckbuilder",
    template: "%s | ripperdeck",
  },
  description:
    "ripperdeck — the deckbuilder for the Cyberpunk 2077 Trading Card Game. Build your crew. Run your gigs.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${jetbrainsMono.variable} ${rajdhani.variable} flex flex-col min-h-screen`}>
        <AuthProvider>
          <CardsProvider>
            <Header />
            <MigrationBanner />
            <main className="flex-1">{children}</main>
            <Footer />
          </CardsProvider>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}
