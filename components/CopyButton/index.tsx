"use client";

// components/CopyButton.jsx
import React, { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";

export interface CopyButtonProps {
  textToCopy?: string;
}

const CopyButton: React.FC<CopyButtonProps> = ({ textToCopy = '' }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard
      .writeText(textToCopy)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000); // 2秒后恢复初始状态
      })
      .catch((err) => {
        console.error("Could not copy text: ", err);
      });
  };

  const Icon = copied ? Check : Copy;

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
