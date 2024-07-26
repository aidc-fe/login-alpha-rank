"use client";

import LoginCarousel from "@/components/login-carousel";
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
import { Loader, Store } from "lucide-react";
import { signIn, signOut, useSession } from "next-auth/react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

function LoginContent() {
  const { status } = useSession();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
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

  // 处理用户成功发送邮件后返回
  useEffect(() => {
    setLoading(false);
  }, []);

  const content = useMemo(() => {
    switch (status) {
      case "authenticated":
        return <></>;
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
              className="space-y-4 w-full"
              onSubmit={(e) => {
                e.preventDefault();
                setLoading(true);
                const formData = new FormData(e.target as HTMLFormElement);
                const email = formData.get("email");
                signIn("email", { email, callbackUrl });
              }}
            >
              <Input
                name="email"
                required
                placeholder="Please enter your email"
                type="email"
                className="h-12 border-primary/50 hover:border-primary"
              />

              <Button
                className="w-full h-12 flex gap-4"
                variant={"outline"}
                size={"lg"}
                type="submit"
                disabled={loading}
              >
                {loading ? (
                  <Loader className="text-primary animate-spin" />
                ) : (
                  <Image
                    src={
                      "https://img.icons8.com/?size=100&id=44829&format=png&color=000000"
                    }
                    width={28}
                    height={28}
                    alt="shopify login logo"
                  ></Image>
                )}
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
                  className="space-y-4 w-full"
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
                    <SelectTrigger className="h-12 border-primary/50 hover:border-primary">
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
                              className="cursor-pointer"
                            >
                              <Store
                                className="inline text-primary mr-3"
                                size={20}
                              />{" "}
                              <strong>{item.shopName}</strong>
                              {"    "}
                              <span className="italic">
                                （https://{item.displayDomain}）
                              </span>
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

            <div className="inline italic text-accent-foreground">
              {/* <Checkbox className="mr-2" /> */}
              By signing in, you are agreeing to our{" "}
              <Button
                onClick={() => {
                  window.open(
                    "https://terms.alicdn.com/legal-agreement/terms/privacy_policy_full/20230725101625561/20230725101625561.html"
                  );
                }}
                variant="link"
                className="p-0 h-fit italic"
              >
                Privacy Policy
              </Button>{" "}
              and{" "}
              <Button
                onClick={() => {
                  window.open(
                    "https://terms.alicdn.com/legal-agreement/terms/c_platform_service_agreement/20230724215237251/20230724215237251.html"
                  );
                }}
                variant="link"
                className="p-0 italic h-fit"
              >
                Terms of Use
              </Button>
              .
            </div>
          </>
        );
      case "loading":
        return <></>;
    }
  }, [callbackUrl, loading, signedStoreList, status, targetUrl]);

  return (
    <div className="flex flex-col justify-center items-center w-full px-4 space-y-8 lg:px-20">
      {content}
    </div>
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
      <main className="grid h-full bg-circle-gradient px-4 md:grid-cols-2">
        <LoginCarousel className="h-full justify-center items-center hidden md:flex" />
        <LoginContent />
      </main>
    </SuspenseWrapper>
  );
}
