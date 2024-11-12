import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Solana Fee Calculator",
  description: "Calculate total transaction fees for any Solana wallet",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
