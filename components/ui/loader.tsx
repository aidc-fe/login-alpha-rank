import { cn } from "@/lib/utils";
import { LoaderCircle } from "lucide-react";
import React from "react";

export interface Loader {
  className?: string;
  loading?: boolean;
  children?: React.ReactNode;
}

const Loader: React.FC<Loader> = ({ className, loading, children }) => {
  return (
    <div className={cn("flex items-center justify-center")}>
      {loading && (
        <div className={cn("", className)}>
          <LoaderCircle className="animate-spin" size={18} />
        </div>
      )}
      {children}
    </div>
  );
};

export default Loader;
