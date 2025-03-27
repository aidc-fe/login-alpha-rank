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
    <div ref={emblaRef} className={cn("overflow-hidden", className)}>
      <div className="flex">
        {(materials || [])?.map(
          ({
            image,
            title,
            description,
          }: {
            image: string;
            title: string;
            description: string;
          }) => {
            return (
              <div
                key={title}
                className="min-w-0 flex-grow-0 flex-shrink-0 basis-full flex flex-col items-center"
              >
                <Image alt={title} height={380} src={image} width={550} />
                <div className="text-xl font-semibold mt-10">{title}</div>
                <div className="mt-4 text-center text-muted max-w-3/5">{description}</div>
              </div>
            );
          }
        )}
      </div>
    </div>
  );
}
