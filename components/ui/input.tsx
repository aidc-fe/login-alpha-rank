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

export interface TextAreaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  layout?: "horizontal" | "vertical";
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
          <span className="font-medium capitalize text-sm">{label}:</span>
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

const Textarea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ className, label, layout = "vertical", ...props }, ref) => {
    if (label) {
      return (
        <label
          className={cn("flex w-full gap-1 flex-col", {
            "flex-row items-center": layout === "horizontal",
          })}
        >
          <span className="font-medium capitalize text-sm">{label}:</span>
          <textarea
            className={cn(
              "h-24 border-primary/50 w-full hover:border-primary flex rounded-md border bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
              className
            )}
            ref={ref}
            {...props}
          />
        </label>
      );
    } else {
      return (
        <textarea
          className={cn(
            "h-24 border-primary/50 hover:border-primary flex w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          ref={ref}
          {...props}
        />
      );
    }
  }
);
Textarea.displayName = "Textarea";

export { Input, Textarea };
