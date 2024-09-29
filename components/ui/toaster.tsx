"use client";

import { Toast, useToast } from "@/hooks/use-toast";
import {
  Toast as ToastRoot,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast";
import { eventBus } from "@/lib/eventBus";
import { CircleAlert, CircleCheckBig } from "lucide-react";
import { useEffect } from "react";

export const toastApi = {
  /**
   * 成功提示
   * @param description message消息
   * @param title 提示标题
   */
  success(description: React.ReactNode, title?: React.ReactNode) {
    eventBus.emit("toast", {
      variant: "constructive",
      description,
      title,
    });
  },
  /**
   * 错误提示
   * @param description message消息
   * @param title 提示标题
   */
  error(description: React.ReactNode, title?: React.ReactNode) {
    eventBus.emit("toast", {
      variant: "destructive",
      description,
      title,
    });
  },
  /**
   * 默认提示
   * @param description message消息
   * @param title 提示标题
   */
  info(description: React.ReactNode, title?: React.ReactNode) {
    eventBus.emit("toast", {
      variant: "default",
      title,
      description,
    });
  },
};

export function Toaster() {
  const { toasts, toast } = useToast();

  useEffect(() => {
    const handleToast = (config: Toast) => {
      toast(config);
    };
    eventBus.on("toast", handleToast);

    return () => {
      eventBus.off("toast", handleToast);
    };
  }, []);

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <ToastRoot key={id} {...props}>
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>
                  {props.variant !== "default" ? (
                    <div className="flex gap-2 items-center">
                      {props.variant === "destructive" ? (
                        <CircleAlert size={20} />
                      ) : (
                        <CircleCheckBig size={20} />
                      )}
                      {description}
                    </div>
                  ) : (
                    description
                  )}
                </ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </ToastRoot>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
}
