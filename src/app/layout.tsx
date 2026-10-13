import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://vibescan-testnet.vercel.app"),
  title: "vibescan · vibe/vibe testnet explorer",
  description:
    "Real-time scanner for vibe/vibe launches on Robinhood Chain Testnet — bonding progress, graduation tracking, buybacks, builder & wallet analytics.",
  openGraph: {
    title: "vibescan · vibe/vibe testnet explorer",
    description:
      "Real-time scanner for vibe/vibe launches on Robinhood Chain Testnet — bonding progress, graduation tracking, buybacks, builder & wallet analytics.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
