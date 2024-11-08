"use client";

// components/CopyButton.jsx
import React, { useState } from "react";
import { Copy, CopyCheck } from "lucide-react";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import { toastApi } from '@/components/ui/toaster';

export interface CopyButtonProps {
  textToCopy?: string;
}

const CopyButton: React.FC<CopyButtonProps> = ({ textToCopy = '' }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard
      .writeText(textToCopy)
      .then(() => {
        toastApi.success("Copied to clipboard");
        setCopied(true);
        setTimeout(() => setCopied(false), 2000); // 2秒后恢复初始状态
      })
      .catch((err) => {
        console.error("Could not copy text: ", err);
        toastApi.error("Failed to copy to clipboard");
      });
  };

  const Icon = copied ? CopyCheck : Copy;

  return (
    <Button
      onClick={handleCopy}
      className={cn("p-0 w-5 h-5 ml-1", { "pointer-events-none": copied })}
      variant="ghost"
      icon={
        <Icon className="text-muted-foreground" size={16} />
      }
    />
  );
};

export default CopyButton;
