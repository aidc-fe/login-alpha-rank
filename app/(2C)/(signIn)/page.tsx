"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import request from "@/lib/request";
import { ArrowUpRight, Loader } from "lucide-react";
import { signIn, useSession } from "next-auth/react";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Home() {
  const { status } = useSession();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState(
    decodeURIComponent(searchParams.get("email") || "")
  );
  const targetUrl = decodeURIComponent(searchParams.get("targetUrl") || "");
  const router = useRouter();
  const callbackUrl = `/login-landing-page?${
    targetUrl ? "targetUrl=" + targetUrl : ""
  }`;

  // 如果用户已经登录，则进行续登
  useEffect(() => {
    if (status === "authenticated") {
      router.replace(`/login-landing-page${location.search}`);
    }
  }, [router, status, targetUrl]);

  // 处理用户成功发送邮件后返回
  useEffect(() => {
    setLoading(false);
  }, []);

  switch (status) {
    case "unauthenticated":
      return (
        <div className="flex flex-col justify-center items-center w-full px-8 space-y-6 ">
          <h1 className="font-bold text-3xl mb-4">Sign in</h1>
          <Tabs
            defaultValue="password"
            className="flex flex-col justify-center items-center w-full space-y-6 h-[300px] "
          >
            <TabsList className="mb-2">
              <TabsTrigger value="password">Password</TabsTrigger>
              <Separator className="h-6 bg-purple-300" orientation="vertical" />
              <TabsTrigger value="magicLink">Email</TabsTrigger>
            </TabsList>

            <TabsContent value="password" className="w-full flex-grow">
              <form
                className="flex flex-col justify-between gap-4 h-full"
                onSubmit={(e) => {
                  e.preventDefault();
                  setLoading(true);
                  const formData = new FormData(e.target as HTMLFormElement);
                  const email = formData.get("email");
                  const password = formData.get("password");

                  // 登录
                  request("/api/signIn", {
                    method: "POST",
                    body: JSON.stringify({ email, password }),
                  })
                    .then((user) => {
                      signIn("password", { ...user, callbackUrl });
                    })
                    .finally(() => {
                      setLoading(false);
                    });
                }}
              >
                <Input
                  name="email"
                  label="email"
                  required
                  placeholder="Please enter your email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                  }}
                />

                <div className="flex flex-col items-end">
                  <Input
                    name="password"
                    label="password"
                    required
                    placeholder="Please enter your password"
                    type="password"
                  />
                  <Button
                    variant={"link"}
                    onClick={(e) => {
                      e.preventDefault();
                      router.push(
                        `/password/emailVerify?email=${encodeURIComponent(
                          email
                        )}`
                      );
                    }}
                    className="group"
                  >
                    Forgot your password{" "}
                    <ArrowUpRight
                      className="group-hover:rotate-45 duration-150"
                      size={16}
                    />
                  </Button>
                </div>

                <div className="grid gap-4 grid-cols-3">
                  <Button
                    className="col-span-2"
                    variant={"default"}
                    size={"lg"}
                    type="submit"
                    disabled={loading}
                  >
                    {loading && <Loader className="animate-spin" />}
                    Sign in
                  </Button>
                  <Button
                    onClick={(e) => {
                      e.preventDefault();
                      router.push(`/signUp?email=${encodeURIComponent(email)}`);
                    }}
                    variant={"outline"}
                    size={"lg"}
                    disabled={loading}
                  >
                    Sign up
                  </Button>
                </div>
              </form>
            </TabsContent>

            <TabsContent
              value="magicLink"
              className="w-full h-full items-center"
            >
              <form
                className="flex flex-col justify-around py-4 h-full"
                onSubmit={(e) => {
                  e.preventDefault();
                  setLoading(true);
                  const formData = new FormData(e.target as HTMLFormElement);
                  const email = formData.get("email");
                  // email验证页面展示
                  sessionStorage.setItem("verifyEmail", email as string);
                  signIn("email", { email, callbackUrl });
                }}
              >
                <Input
                  name="email"
                  label="email"
                  required
                  placeholder="Please enter your email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                  }}
                />
                <Button
                  className="col-span-2"
                  variant={"default"}
                  size={"lg"}
                  type="submit"
                  disabled={loading}
                >
                  {loading && <Loader className="animate-spin" />}
                  <span className="text-white text-lg font-medium">
                    Sign in
                  </span>
                </Button>
              </form>
            </TabsContent>
          </Tabs>
          <div className="w-full flex items-center">
            <div className="bg-gradient-to-r from-transparent to-primary/40 dark:to-neutral-700 my-4 h-[1px] w-full" />
            <span className=" p-2 text-muted-foreground text-sm">or</span>
            <div className="bg-gradient-to-r from-primary/40 dark:from-neutral-700 to-transparent my-4 h-[1px] w-full" />
          </div>

          <Button
            variant={"outline"}
            size={"lg"}
            onClick={() => signIn("google", { callbackUrl })}
          >
            <Image
              height="24"
              width="24"
              alt="provider-logo-dark"
              src="https://authjs.dev/img/providers/google.svg"
            ></Image>
            Google
          </Button>

          <div className="inline w-full italic text-accent-foreground">
            By signing in, you are agreeing to our{" "}
            <Button
              onClick={() => {
                window.open(
                  "https://terms.alicdn.com/legal-agreement/terms/privacy_policy_full/20231109180939630/20231109180939630.html"
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
                  "https://terms.alicdn.com/legal-agreement/terms/b_platform_service_agreement/20231110160335349/20231110160335349.html"
                );
              }}
              variant="link"
              className="p-0 italic h-fit"
            >
              Terms of Use
            </Button>
            .
          </div>
        </div>
      );
    case "authenticated":
    case "loading":
    default:
      return <></>;
  }
}
