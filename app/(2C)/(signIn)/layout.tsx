
import LoginCarousel from "@/components/login-carousel";
import Image from "next/image";


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <main className="max-w-7xl mx-auto grid h-screen items-center md:grid-cols-2 relative">
      <div className="h-full bg-circle-gradient hidden justify-center md:flex">
        <LoginCarousel className="justify-center items-center hidden md:flex" />
      </div>
      {children}
      <Image
        className="hidden md:block absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 object-cover -z-[1]"
        width={1102}
        height={640}
        src="https://img.alicdn.com/imgextra/i2/O1CN01KzwHFT29ynnmyUEau_!!6000000008137-49-tps-2586-1480.webp"
        alt="background"
      />
    </main>
  );
}
