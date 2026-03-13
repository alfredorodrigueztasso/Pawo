import type { Metadata } from "next";
import "@orion-ds/react/styles.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pawo — Shared expenses for couples",
  description: "Divide expenses with your partner, fairly and without friction.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
