import Image from "next/image";

const Header = () => {
  return (
    <header className="fixed z-50 top-0 left-0 right-0 px-6 h-20 border-b flex items-center justify-between bg-white">
      <div className="flex items-center gap-6">
        <Image
          alt="alpha rank"
          height={40}
          src="https://img.alicdn.com/imgextra/i1/O1CN010T4WOv1kED3JBbd9A_!!6000000004651-49-tps-64-64.webp"
          width={40}
        />
        <span className="text-2xl font-bold text-black">PLG Login Admin</span>
      </div>
    </header>
  );
};

export default Header;
