import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Header = () => {
  return (
    <header className="fixed z-10 top-0 left-0 right-0 px-6 h-20 border-b flex items-center justify-between bg-white">
      <div className="flex items-center gap-6">
        <Image
          width={40}
          height={40}
          src="https://img.alicdn.com/imgextra/i1/O1CN010T4WOv1kED3JBbd9A_!!6000000004651-49-tps-64-64.webp"
          alt="alpha rank"
        />
        <span className="text-2xl font-bold text-black">
          AlphaRank Login Admin
        </span>
      </div>
      <div className="flex items-center gap-6">
        <Avatar>
          <AvatarImage src="https://img.alicdn.com/imgextra/i1/O1CN010T4WOv1kED3JBbd9A_!!6000000004651-49-tps-64-64.webp" />
          <AvatarFallback>AP</AvatarFallback>
        </Avatar>
        <div className="text-xl font-medium text-black">Alpha Rank</div>
      </div>
    </header>
  );
};

export default Header;