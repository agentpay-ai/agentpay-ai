import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "@/app/globals.css";
import { WalletProvider } from "@/components/WalletProvider";
import { BottomNav } from "@/components/BottomNav";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AgentPay AI — Pay-Per-Prompt AI on MiniPay",
  description: "Mobile-first pay-as-you-go AI tools powered by Celo stablecoin micropayments.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-slate-950 text-slate-100 min-h-screen antialiased selection:bg-amber-400 selection:text-slate-900 pb-16`}>
        <WalletProvider>
          {children}
          <BottomNav />
        </WalletProvider>
      </body>
    </html>
  );
}
