
import * as React from "react";
import { type ThemeProviderProps } from "next-themes/dist/types";
import {NextUIProvider} from "@nextui-org/react";

export function NextUIProviderWrapper({ children, ...props }: ThemeProviderProps) {


  return <NextUIProvider className="h-screen" {...props}>{children}</NextUIProvider>;
}


