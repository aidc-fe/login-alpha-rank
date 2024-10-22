import type { Metadata } from "next";
import LoginCarousel from "@/components/login-carousel";

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
    <main className="grid h-full items-center md:grid-cols-2">
      <div className="h-full bg-circle-gradient flex justify-center">
        <LoginCarousel className="justify-center items-center hidden md:flex" />
      </div>
      {children}
    </main>
  );
}
