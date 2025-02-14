"use client";

import request from "@/lib/request";
import { ArrowUpRight } from "lucide-react";
import { signIn, useSession } from "next-auth/react";
import { Button, cn, Input, Link, Spinner } from "@nextui-org/react";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useClient } from "@/providers/client-provider";
import { Session } from "next-auth";
import PasswordInput from "@/components/PasswordInput";
import { AUTH_METHOD } from "@/lib/admin";

export default function Home() {
  const { status, data } = useSession() as {
    status: "loading" | "authenticated" | "unauthenticated";
    data: (Session & { id: string }) | null;
  };
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [email, setEmail] = useState(
    decodeURIComponent(searchParams.get("email") || "")
  );
  const [googleLoading, setGoogleLoading] = useState(false);
  const [jumpEmail, setJumpEmail] = useState("");
  const targetUrl = decodeURIComponent(searchParams.get("targetUrl") || "");
  const router = useRouter();
  const [callbackUrl, setCallbackUrl] = useState("");
  const { businessDomainId, isSSO, redirect_uris, client_id, pp_doc, tos_doc, login_methods = [] } =
    useClient();


  // 根据是否是单点登录，判断登录后跳转的页面
  useEffect(() => {
    if (isSSO === undefined) {
      return;
    } else if (isSSO) {
      setCallbackUrl(
        `/login-landing-page?${targetUrl ? "targetUrl=" + targetUrl : ""}`
      );
    } else {
      setCallbackUrl(
        `/api/oauth/authorize/default?redirect_uri=${redirect_uris?.[0]}&client_id=${client_id}&callbackUrl=${window.opener && window.name === "loginWindow" ? `${window.location.origin}/popup-login` : ""}${searchParams.get("utmSource") ? `&utmSource=${searchParams.get("utmSource")}&utmType=sign_in` : ""}`
      );
    }
  }, [isSSO]);

  // 如果用户已经登录，则进行续登
  useEffect(() => {
    if (status === "authenticated") {
      if (isSSO) {
        router.replace(`/login-landing-page${location.search}`);
      } else if (callbackUrl) {
        router.replace(`${callbackUrl}&userId=${data?.id}`);
      }
    }
  }, [router, status, data, isSSO, callbackUrl]);

  switch (status) {
    case "unauthenticated":
      return (
        <div className="flex items-center justify-center w-full h-full px-8 -mr-4 space-y-6">
          <div className="max-w-lg">
            <h1 className="font-bold text-3xl mb-12 text-center">Sign in</h1>
            
            {/* 密码登录表单 */}
            {login_methods.includes(AUTH_METHOD.PASSWORD) && (
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
                    body: JSON.stringify({ email, password, businessDomainId }),
                  })
                    .then((user) => {
                      signIn("password", {
                        ...user,
                        callbackUrl: `${callbackUrl}&userId=${user.sub}`,
                        businessDomainId,
                      }).finally(() => {
                        setLoading(false);
                      });
                    })
                    .catch(() => {
                      setLoading(false);
                    });
                }}
              >
                <Input
                  name="email"
                  label="E-mail"
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <PasswordInput name="password" label="Password" required />

                <div className="flex justify-between mb-3">
                  <Link
                    showAnchorIcon
                    anchorIcon={
                      <ArrowUpRight
                        className="group-hover:rotate-45 duration-150"
                        size={20}
                      />
                    }
                    underline="always"
                    className="group text-muted"
                    href={`/password/emailVerify?email=${encodeURIComponent(
                      email
                    )}`}
                  >
                    Forgot your password{" "}
                  </Link>
                  <div className="text-muted">
                    Not a member?{" "}
                    <Link
                      underline="always"
                      href={`/signUp?email=${encodeURIComponent(email)}`}
                      isDisabled={loading || emailLoading || googleLoading}
                    >
                      Sign up
                    </Link>
                  </div>
                </div>

                <Button
                  color="primary"
                  type="submit"
                  size="lg"
                  spinner={<Spinner color="default" size="sm" />}
                  isLoading={loading}
                  isDisabled={emailLoading || googleLoading}
                >
                  Sign in
                </Button>
              </form>
            )}

            {/* 分隔线，只在有多个登录方式时显示 */}
            {login_methods.length > 1 && (
              <div className="w-full flex items-center text-muted">
                <div className="bg-muted/60 my-4 h-[1px] w-full" />
                <span className="py-4 px-8 text-input text-sm">or</span>
                <div className="bg-muted/60 my-4 h-[1px] w-full" />
              </div>
            )}

            {/* Google登录按钮 */}
            {login_methods.includes(AUTH_METHOD.GOOGLE) && (
              <Button
                className="w-full"
                size="lg"
                onClick={() => {
                  setGoogleLoading(true);
                  signIn("google", { callbackUrl }).catch(() => {
                    setGoogleLoading(false);
                  });
                }}
                spinner={<Spinner color="primary" size="sm" />}
                isDisabled={loading || emailLoading}
                isLoading={googleLoading}
              >
                <Image
                  height="24"
                  width="24"
                  alt="provider-logo-dark"
                  src="https://authjs.dev/img/providers/google.svg"
                />
                Google
              </Button>
            )}

            {/* 邮箱登录表单 */}
            {login_methods.includes(AUTH_METHOD.EMAIL) && (
              <form
                className={cn("flex py-4 gap-3 items-center", {"py-0": !login_methods.includes(AUTH_METHOD.GOOGLE)})}
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
                      signIn("email", {
                        email,
                        callbackUrl: `${window.location.origin}${callbackUrl}`,
                        businessDomainId,
                      }).finally(() => {
                        setEmailLoading(false);
                      });
                    })
                    .catch(() => {
                      setEmailLoading(false);
                    });
                }}
              >
                <Input
                  name="email"
                  required
                  label="Enter email address for Magic Link Authentication"
                  type="email"
                  value={jumpEmail}
                  onChange={(e) => setJumpEmail(e.target.value)}
                />
                <Button
                  color="primary"
                  type="submit"
                  size="lg"
                  spinner={<Spinner color="default" size="sm" />}
                  isLoading={emailLoading}
                  isDisabled={loading || googleLoading}
                >
                  Sign in
                </Button>
              </form>
            )}

            {/* 服务条款和隐私政策 */}
            <div className="w-1/2 border-b mx-auto mt-4" />
            <div className="w-full text-foreground-500 font-normal text-center mt-4">
              By continuing with any of the options above, you agree to our{" "}
              {tos_doc && (
                <Link href={tos_doc} isExternal underline="always">
                  Terms of Service
                </Link>
              )}{" "}
              and have read our{" "}
              {pp_doc && (
                <Link href={pp_doc} isExternal underline="always">
                  Privacy Policy
                </Link>
              )}{" "}
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
