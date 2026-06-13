import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Diamond Creation CRM",
  description: "Plateforme CRM pour agences marketing",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className="dark">
      <body className={`${inter.variable} font-body bg-diamond-black text-white antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
