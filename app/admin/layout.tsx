import type { Metadata } from "next";

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
    <main className="grid h-full items-center bg-circle-gradient px-4 ">
      {/* <div className="w-80">Tab</div>  grid-cols-[auto_1fr]*/}
      <div className="m-auto w-full max-w-7xl">
        {children}
      </div>
    </main>
  );
}
