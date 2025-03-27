import type { Metadata } from "next";

import { Analytics } from "@vercel/analytics/react";

import { GoogleTagManager } from "@next/third-parties/google";
import { ToastContainer } from "react-toastify";
import SessionProvider from "@/providers/session-provider";
import "@/styles/globals.css";
import SuspenseWrapper from "@/components/suspend-wrapper";

import { NextUIProviderWrapper } from "@/providers/nextui-provider";

import "react-toastify/dist/ReactToastify.css";

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
        {process.env.ENV === "production" && <GoogleTagManager gtmId="GTM-M5XV9Z8Z" />}
        <script
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
          type="text/javascript"
        />
      </head>
      <body className={"h-screen"}>
        <NextUIProviderWrapper>
          <SuspenseWrapper>
            <SessionProvider>{children}</SessionProvider>
          </SuspenseWrapper>
          <Analytics />
          <ToastContainer bodyClassName="items-start [&_div:first-child]:mt-0.5" />
        </NextUIProviderWrapper>
      </body>
    </html>
  );
}
