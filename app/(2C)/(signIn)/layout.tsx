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
    <main className="grid h-full items-center bg-circle-gradient md:grid-cols-2">
      <LoginCarousel className="justify-center items-center hidden md:flex" />
      {children}
    </main>
  );
}
