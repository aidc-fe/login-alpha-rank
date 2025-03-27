import { Loader } from "lucide-react";
import { Suspense } from "react";

const SuspenseWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <Suspense
      fallback={
        <main className="h-full flex justify-center items-center w-full">
          <Loader className="text-primary animate-spin" size={60} />
        </main>
      }
    >
      {children}
    </Suspense>
  );
};

export default SuspenseWrapper;
