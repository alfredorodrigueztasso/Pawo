import type { Metadata } from "next";
import { DM_Sans, Inter } from "next/font/google";
import "@orion-ds/react/styles.css";
import "./globals.css";
import { createClient } from "@/lib/supabase/server";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-dm-sans",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Pawo — Shared expenses for couples",
  description: "Divide expenses with your partner, fairly and without friction.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const theme = (user?.user_metadata?.theme as "light" | "dark") ?? "light";

  return (
    <html
      lang="en"
      data-theme={theme}
      data-brand="orange"
      data-mode="app"
      suppressHydrationWarning
      className={`${dmSans.variable} ${inter.variable}`}
    >
      <body>
        {children}
      </body>
    </html>
  );
}
