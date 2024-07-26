import React from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import Image from "next/image";
import { cn } from "@/lib/utils";

const data = [
  {
    img: "https://img.alicdn.com/imgextra/i2/O1CN01Tp1fj91wSCXZZGgzd_!!6000000006306-49-tps-1312-884.webp",
    title: "Keyword and Topic Research",
    desc: "Identify the keywords that resonate the most with your audience",
  },
  {
    img: "https://img.alicdn.com/imgextra/i2/O1CN01m62Dtj1dAooFQd2ce_!!6000000003696-49-tps-1312-884.webp",
    title: "SEO Blog Generator",
    desc: "Create a fantastic piece of content that is highly readable and optimized for SEO",
  },
  {
    img: "https://img.alicdn.com/imgextra/i2/O1CN01IPlWez1Z6uyONeOxP_!!6000000003146-49-tps-1312-884.webp",
    title: "Competitor Analysis",
    desc: "Benchmark your website traffic against competitors to see where you stand",
  },
];

export default function LoginCarousel({ className }: { className?: string }) {
  const [emblaRef] = useEmblaCarousel({ loop: true }, [Autoplay()]);

  return (
    <div className={cn("overflow-hidden", className)} ref={emblaRef}>
      <div className="flex">
        {data.map(({ img, title, desc }) => {
          return (
            <div
              className="min-w-0 flex-grow-0 flex-shrink-0 basis-full flex flex-col items-center"
              key={title}
            >
              <Image src={img} width={550} height={380} alt={title} />
              <div className="text-3xl font-semibold">{title}</div>
              <div className="mt-4 text-center max-w-3/5">{desc}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
