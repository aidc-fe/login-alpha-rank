import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import SessionProvider from "@/providers/session-provider";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/theme/provider";
import "./globals.css";
import SuspenseWrapper from "@/components/suspend-wrapper";
import { Toaster } from "@/components/ui/toaster";
import { GoogleTagManager } from "@next/third-parties/google";

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
      <head>
        {process.env.ENV === "production" && (
          <GoogleTagManager gtmId="GTM-M5XV9Z8Z" />
        )}
        <script
          type="text/javascript"
          dangerouslySetInnerHTML={{
            __html:
              process.env.ENV === "production"
                ? `(function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "m7nejsf2ai")`
                : "",
          }}
        ></script>
      </head>
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
