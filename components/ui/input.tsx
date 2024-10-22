import * as React from "react";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const inputVariants = cva(
  "h-10 border-border w-full flex rounded-md border bg-transparent px-3 py-1 text-sm transition-all file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:!bg-input-disabled-background disabled:hover:border-border",
  {
    variants: {
      status: {
        default: "hover:border-primary focus-visible:ring-ring",
        error:
          "border-destructive focus-visible:ring-destructive focus-visible:border-border",
      },
      layout: {
        horizontal: "flex-1",
        vertical: "",
      },
    },
    defaultVariants: {
      status: "default",
      layout: "horizontal",
    },
  }
);

const layoutVariants = cva("flex w-full gap-1.5", {
  variants: {
    layout: {
      horizontal: "flex-row items-center",
      vertical: "flex-col",
    },
  },
  defaultVariants: {
    layout: "horizontal",
  },
});

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {
  rootClassName?: string;
  label?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    { className, rootClassName, type, label, status, layout, ...props },
    ref
  ) => {
    return (
      <label
        className={cn(layoutVariants({ layout, className: rootClassName }))}
      >
        {label ? (
          <span className="font-medium capitalize text-sm">{label}</span>
        ) : null}
        <input
          type={type}
          className={cn(inputVariants({ status, layout, className }))}
          ref={ref}
          {...props}
        />
      </label>
    );
  }
);
Input.displayName = "Input";

export { Input };
