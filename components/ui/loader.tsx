import { LoaderCircle } from "lucide-react";
import React from "react";

import { cn } from "@/lib/utils";

export interface Loader {
  className?: string;
  loading?: boolean;
  children?: React.ReactNode;
}

const Loader: React.FC<Loader> = ({ className, loading, children }) => {
  return (
    <div className="w-full h-full relative">
      {loading && (
        <div
          className={cn(
            "absolute inset-0 flex justify-center pt-32 bg-background/50 z-10",
            className
          )}
        >
          <LoaderCircle className="animate-spin text-primary" size={30} />
        </div>
      )}
      {children}
    </div>
  );
};

export default Loader;
