"use client";

import request from "@/lib/request";
import { Button, Input, Link } from "@nextui-org/react";
import { ArrowUpRight } from "lucide-react";
import { signIn, useSession } from "next-auth/react";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Home() {
  const { status } = useSession();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [email, setEmail] = useState(
    decodeURIComponent(searchParams.get("email") || "")
  );
  const [jumpEmail, setJumpEmail] = useState("");
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
    setEmailLoading(false);
  }, []);

  switch (status) {
    case "unauthenticated":
      return (
        <div className="flex items-center justify-center w-full h-full px-8 -mr-4 space-y-6">
          <div className="max-w-lg">
            <h1 className="font-bold text-3xl mb-12 text-center">Sign in</h1>
            <form
              className="flex flex-col justify-between gap-4"
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
                required
                placeholder="E-mail"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                }}
              />
              <Input
                name="password"
                required
                placeholder="Password"
                type="password"
              />

              <div className="flex justify-between">
                <Link
                  underline="always"
                  showAnchorIcon
                  className="group p-0 h-auto"
                  anchorIcon={<ArrowUpRight className="group-hover:rotate-45 duration-150" size={16} />}
                  href={`/password/emailVerify?email=${encodeURIComponent(email)}`}
                >
                  Forgot your password
                </Link>
                <div className="text-muted-foreground">
                  Not a member?{" "}
                  <Link
                    href={`/signUp?email=${encodeURIComponent(email)}`}
                    underline="always"
                    isDisabled={loading || emailLoading}
                  >
                    Sign up
                  </Link>
                </div>
              </div>

              <Button
                type="submit"
                isLoading={loading}
                isDisabled={emailLoading}
                color="primary"
              >
                Sign in
              </Button>
            </form>

            <div className="w-full flex items-center">
              <div className="bg-gradient-to-r from-transparent to-neutral-300 dark:to-neutral-700 my-4 h-[1px] w-full" />
              <span className="py-4 px-8 text-input text-sm">or</span>
              <div className="bg-gradient-to-r from-neutral-300 dark:from-neutral-700 to-transparent my-4 h-[1px] w-full" />
            </div>

            <Button
              variant="bordered"
              className="w-full"
              onClick={() => signIn("google", { callbackUrl })}
              startContent={<Image
                height="24"
                width="24"
                alt="provider-logo-dark"
                src="https://authjs.dev/img/providers/google.svg"
              ></Image>}
            >
              Google
            </Button>
            <form
              className="flex py-4 gap-3"
              onSubmit={(e) => {
                e.preventDefault();
                setEmailLoading(true);
                const formData = new FormData(e.target as HTMLFormElement);
                const email = formData.get("email");

                request("/api/emailRateLimit", {
                  method: "POST",
                  body: JSON.stringify({ email }),
                })
                  .then(() => {
                    // email验证页面展示
                    sessionStorage.setItem("verifyEmail", email as string);
                    signIn("email", { email, callbackUrl });
                  })
                  .finally(() => {
                    setEmailLoading(false);
                  });
              }}
            >
              <Input
                className="flex-1"
                name="email"
                required
                placeholder={
                  "Enter email address for Magic Link Authentication"
                }
                type="email"
                value={jumpEmail}
                onChange={(e) => {
                  setJumpEmail(e.target.value);
                }}
              />
              <Button type="submit" color="primary" isLoading={emailLoading} isDisabled={loading}>
                <span>Sign in</span>
              </Button>
            </form>
            <div className="w-1/2 border-b mx-auto mt-4" />
            <div className="w-full text-muted-foreground text-sm font-normal text-center mt-4">
              By continuing with any of the options above, you agree to our{" "}
              <Link
                href={"https://terms.alicdn.com/legal-agreement/terms/b_platform_service_agreement/20231110160335349/20231110160335349.html"}
                underline="always"
                isExternal
                size="sm"
              >
                Terms of Service
              </Link>{" "}
              and have read our{" "}
              <Link
                href={"https://terms.alicdn.com/legal-agreement/terms/privacy_policy_full/20231109180939630/20231109180939630.html"}
                underline="always"
                isExternal
                size="sm"
              >
                Privacy Policy
              </Link>{" "}
              .
            </div>
          </div>
        </div>
      );
    case "authenticated":
    case "loading":
    default:
      return <></>;
  }
}
