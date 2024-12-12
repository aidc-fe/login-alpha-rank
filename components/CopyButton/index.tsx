"use client";

// components/CopyButton.jsx
import React, { useState } from "react";
import { Copy, CopyCheck } from "lucide-react";
import { Button } from "@nextui-org/react";
import { cn } from "@/lib/utils";
import { toast } from "react-toastify";

export interface CopyButtonProps {
  textToCopy?: string;
}

const CopyButton: React.FC<CopyButtonProps> = ({ textToCopy = "" }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard
      .writeText(textToCopy)
      .then(() => {
        toast.success("Copied to clipboard");
        setCopied(true);
        setTimeout(() => setCopied(false), 2000); // 2秒后恢复初始状态
      })
      .catch((err) => {
        console.error("Could not copy text: ", err);
        toast.error("Failed to copy to clipboard");
      });
  };

  const Icon = copied ? CopyCheck : Copy;

  return (
    <Button
      onClick={handleCopy}
      className={cn("p-0 w-auto min-w-0 h-5 ml-1", { "pointer-events-none": copied })}
      variant="light"
      isIconOnly
    >
      <Icon className="text-muted" size={16} />
    </Button>
  );
};

export default CopyButton;
