"use client";
import React from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useClient } from "@/providers/client-provider";

export default function LoginCarousel({ className }: { className?: string }) {
  const [emblaRef] = useEmblaCarousel({ loop: true }, [Autoplay()]);
  const { materials } = useClient();

  return (
    <div className={cn("overflow-hidden", className)} ref={emblaRef}>
      <div className="flex">
        {JSON.parse(materials as string || "[]").map(({ image, title, description }:{image:string,title:string,description:string}) => {
          return (
            <div
              className="min-w-0 flex-grow-0 flex-shrink-0 basis-full flex flex-col items-center"
              key={title}
            >
              <Image src={image} width={550} height={380} alt={title} />
              <div className="text-xl font-semibold mt-10">{title}</div>
              <div className="mt-4 text-center text-muted-foreground max-w-3/5">
                {description}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
