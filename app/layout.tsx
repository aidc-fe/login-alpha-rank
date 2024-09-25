import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import SessionProvider from "@/providers/session-provider";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/theme/provider";
import "./globals.css";
import SuspenseWrapper from "@/components/suspend-wrapper";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Alpha Rank Login",
  description: "Login to your Alpha Rank",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={cn(inter.className, "h-screen")}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          // enableSystem
          disableTransitionOnChange
        >
          <SuspenseWrapper>
            <SessionProvider>{children}</SessionProvider>
          </SuspenseWrapper>
        </ThemeProvider>
        <Analytics />
        <Toaster />
      </body>
    </html>
  );
}
