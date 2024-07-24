"use client";

import SuspenseWrapper from "@/components/suspend-wrapper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { signIn, signOut, useSession } from "next-auth/react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo } from "react";

function PageContent() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const targetUrl = searchParams.get("targetUrl") || "";
  const callbackUrl = `/login-landing-page?${
    targetUrl ? "targetUrl=" + targetUrl : ""
  }`;
  const signedStoreList = JSON.parse(
    localStorage.getItem("signedStoreList") || "[]"
  );

  // 如果用户已经登录，则自动重定向到默认地址
  useEffect(() => {
    if (status === "authenticated") {
      window.location.href =
        targetUrl || process.env.NEXT_PUBLIC_DEFAULT_TARGET_URL || "";
    }
  }, [status, targetUrl]);

  const content = useMemo(() => {
    switch (status) {
      case "authenticated":
        return (
          <Button
            className="w-full h-12 flex gap-4"
            variant={"outline"}
            size={"lg"}
            onClick={() => {
              signOut();
            }}
          >
            <span className="text-neutral-700 text-lg font-medium dark:text-neutral-300">
              Sigh Out
            </span>
            <BottomGradient />
          </Button>
        );
      case "unauthenticated":
        return (
          <>
            <Button
              variant={"outline"}
              size={"lg"}
              className="w-full h-12 flex gap-4"
              onClick={() => signIn("google", { callbackUrl })}
            >
              <Image
                height="24"
                width="24"
                alt="provider-logo-dark"
                src="https://authjs.dev/img/providers/google.svg"
              ></Image>
              <span className="text-neutral-700 text-lg font-medium dark:text-neutral-300">
                Google
              </span>
              <BottomGradient />
            </Button>

            <div className="bg-gradient-to-r from-transparent via-primary/40 dark:via-neutral-700 to-transparent my-8 h-[1px] w-full" />

            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target as HTMLFormElement);
                const email = formData.get("email");
                signIn("email", { email, callbackUrl });
              }}
            >
              <LabelInputContainer>
                <Input
                  name="email"
                  required
                  placeholder="Please enter your email"
                  type="email"
                  className="h-10"
                />
              </LabelInputContainer>

              <Button
                className="w-full h-12 flex gap-4"
                variant={"outline"}
                size={"lg"}
                type="submit"
              >
                <Image
                  src={
                    "https://img.icons8.com/?size=100&id=44829&format=png&color=000000"
                  }
                  width={28}
                  height={28}
                  alt="shopify login logo"
                ></Image>
                <span className="text-neutral-700 text-lg font-medium dark:text-neutral-300">
                  Email
                </span>
                <BottomGradient />
              </Button>
            </form>

            {signedStoreList?.length > 0 ? (
              <>
                <div className="bg-gradient-to-r from-transparent via-primary/40 dark:via-neutral-700 to-transparent my-8 h-[1px] w-full" />

                <form
                  className="space-y-4"
                  onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.target as HTMLFormElement);
                    const shopDomain = formData.get("shopDomain");
                    if (!shopDomain) {
                      return;
                    }
                    window.location.href = `${process.env.NEXT_PUBLIC_NEXT_AUTH_URL}/shopify/auth?shopDomain=${shopDomain}&targetUrl=${targetUrl}`;
                  }}
                >
                  <Select required name="shopDomain">
                    <SelectTrigger>
                      <SelectValue placeholder="Please select your shop domain" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      {signedStoreList.map(
                        (item: {
                          shopDomain: string;
                          shopName: string;
                          displayDomain: string;
                        }) => {
                          return (
                            <SelectItem
                              key={item.shopDomain}
                              value={item.shopDomain}
                            >
                              {item.shopName}:{item.displayDomain}
                            </SelectItem>
                          );
                        }
                      )}
                    </SelectContent>
                  </Select>

                  <Button
                    className="w-full h-12 flex gap-4"
                    variant={"outline"}
                    size={"lg"}
                    type="submit"
                  >
                    <Image
                      src={
                        "https://img.icons8.com/?size=100&id=uSHYbs6PJfMT&format=png&color=000000"
                      }
                      width={28}
                      height={28}
                      alt="shopify login logo"
                    ></Image>
                    <span className="text-neutral-700 text-lg font-medium dark:text-neutral-300">
                      Shopify
                    </span>
                    <BottomGradient />
                  </Button>
                </form>
              </>
            ) : (
              <></>
            )}
          </>
        );
      case "loading":
        return <div>loading</div>;
    }
  }, [callbackUrl, signedStoreList, status, targetUrl]);

  return (
    <main className="h-full flex flex-col justify-center items-center ">
      <div className="w-3/5 space-y-8">{content}</div>
    </main>
  );
}

const BottomGradient = () => {
  return (
    <>
      <span className="group-hover/btn:opacity-100 block transition duration-500 opacity-0 absolute h-px w-full -bottom-px inset-x-0 bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
      <span className="group-hover/btn:opacity-100 blur-sm block transition duration-500 opacity-0 absolute h-px w-1/2 mx-auto -bottom-px inset-x-10 bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
    </>
  );
};

const LabelInputContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn("flex flex-col space-y-2 w-full", className)}>
      {children}
    </div>
  );
};

export default function Home() {
  return (
    <SuspenseWrapper>
      <PageContent />
    </SuspenseWrapper>
  );
}
