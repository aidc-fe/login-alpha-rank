import type { Metadata } from "next";
import LoginCarousel from "@/components/login-carousel";
import SuspenseWrapper from "@/components/suspend-wrapper";

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
    <SuspenseWrapper>
      <main className="grid h-full items-center bg-circle-gradient px-4 md:grid-cols-2">
        <LoginCarousel className="justify-center items-center hidden md:flex" />
        {children}
      </main>
    </SuspenseWrapper>
  );
}
