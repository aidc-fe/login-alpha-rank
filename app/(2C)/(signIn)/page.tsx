"use client";

import { ArrowUpRight } from "lucide-react";
import { signIn, useSession } from "next-auth/react";
import { Button, cn, Input, Link, Spinner } from "@nextui-org/react";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Session } from "next-auth";
import Turnstile from "react-turnstile";
import { toast } from "react-toastify";

import { useClient } from "@/providers/client-provider";
import PasswordInput from "@/components/PasswordInput";
import { AUTH_METHOD } from "@/lib/admin";
import request from "@/lib/request";
import { encryptWithRSA } from "@/lib/rsa";

export default function Home() {
  const { status, data } = useSession() as {
    status: "loading" | "authenticated" | "unauthenticated";
    data: (Session & { id: string }) | null;
  };
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [email, setEmail] = useState(decodeURIComponent(searchParams.get("email") || ""));
  const [password, setPassword] = useState("");
  const [googleLoading, setGoogleLoading] = useState(false);
  const [jumpEmail, setJumpEmail] = useState("");
  const targetUrl = decodeURIComponent(searchParams.get("targetUrl") || "");
  const router = useRouter();
  const [callbackUrl, setCallbackUrl] = useState("");
  const [token, setToken] = useState("");

  const {
    businessDomainId,
    isSSO,
    redirect_uris,
    client_id,
    pp_doc,
    tos_doc,
    login_methods = [],
  } = useClient();

  // 根据是否是单点登录，判断登录后跳转的页面
  useEffect(() => {
    if (isSSO === undefined) {
      return;
    } else if (isSSO) {
      setCallbackUrl(`/login-landing-page?${targetUrl ? "targetUrl=" + targetUrl : ""}`);
    } else {
      const invite = sessionStorage.getItem("invite");
      const loginReferral = sessionStorage.getItem("loginReferral");

      setCallbackUrl(
        `/api/oauth/authorize/default?redirect_uri=${
          redirect_uris?.[0]
        }&client_id=${client_id}&callbackUrl=${
          window.opener && window.name === "loginWindow"
            ? `${window.location.origin}/popup-login`
            : ""
        }&auth_action=sign_in${invite ? `&invite=${invite}` : ""}${loginReferral ? `&loginReferral=${loginReferral}` : ""}`
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      toast.error("Please verify the captcha");
      return;
    }

    if (!email || !password) {
      toast.error("Email and password are required");
      return;
    }

    setLoading(true);
    try {
      // 获取公钥
      const response = await fetch("/api/rsa/public-key");
      const { publicKey } = await response.json();

      // 加密密码
      const encryptedPassword = encryptWithRSA(password, publicKey);

      // 登录
      request("/api/signIn", {
        method: "POST",
        body: JSON.stringify({
          email,
          password: encryptedPassword,
          businessDomainId,
          token,
        }),
      })
        .then(user => {
          signIn("password", {
            ...user,
            callbackUrl: `${callbackUrl}&userId=${user.sub}`,
            businessDomainId,
          });
        })
        .catch(() => {
          window.location.reload();
        })
        .finally(() => {
          setLoading(false);
        });
    } catch (error) {
      setLoading(false);
    }
  };

  switch (status) {
    case "unauthenticated":
      return (
        <div className="flex items-center justify-center w-full h-full px-8 -mr-4 space-y-6">
          <div className="max-w-lg">
            <h1 className="font-bold text-3xl mb-12 text-center">Sign in</h1>

            {/* 密码登录表单 */}
            {login_methods.includes(AUTH_METHOD.PASSWORD) && (
              <form className="flex flex-col justify-between gap-4" onSubmit={handleSubmit}>
                <Input
                  id="email"
                  label={<label htmlFor="email">Email</label>}
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  type="email"
                />
                <PasswordInput
                  id="password"
                  label={<label htmlFor="password">Password</label>}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                />

                <div className="flex justify-between mb-3">
                  <Link
                    showAnchorIcon
                    anchorIcon={
                      <ArrowUpRight className="group-hover:rotate-45 duration-150" size={20} />
                    }
                    className="group text-muted"
                    href={`/password/emailVerify?email=${encodeURIComponent(email)}`}
                    underline="always"
                  >
                    Forgot your password{" "}
                  </Link>
                  <div className="text-muted">
                    Not a member?{" "}
                    <Link
                      href={`/signUp?email=${encodeURIComponent(email)}`}
                      isDisabled={loading || emailLoading || googleLoading}
                      underline="always"
                    >
                      Sign up
                    </Link>
                  </div>
                </div>
                <Turnstile
                  className="mx-auto"
                  refreshExpired="auto"
                  sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
                  onVerify={token => setToken(token)} // 验证成功后获取 token
                />

                <Button
                  color="primary"
                  isDisabled={emailLoading || googleLoading}
                  isLoading={loading}
                  size="lg"
                  spinner={<Spinner color="default" size="sm" />}
                  type="submit"
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
                isDisabled={loading || emailLoading}
                isLoading={googleLoading}
                size="lg"
                spinner={<Spinner color="primary" size="sm" />}
                onClick={() => {
                  setGoogleLoading(true);
                  signIn("google", { callbackUrl: `${callbackUrl}&auth_type=google` }).catch(() => {
                    setGoogleLoading(false);
                  });
                }}
              >
                <Image
                  alt="provider-logo-dark"
                  height="24"
                  src="https://authjs.dev/img/providers/google.svg"
                  width="24"
                />
                Google
              </Button>
            )}

            {/* 邮箱登录表单 */}
            {login_methods.includes(AUTH_METHOD.EMAIL) && (
              <form
                className={cn("flex py-4 gap-3 items-center", {
                  "py-0": !login_methods.includes(AUTH_METHOD.GOOGLE),
                })}
                onSubmit={e => {
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
                  required
                  label="Enter email address for Magic Link Authentication"
                  name="email"
                  type="email"
                  value={jumpEmail}
                  onChange={e => setJumpEmail(e.target.value)}
                />
                <Button
                  color="primary"
                  isDisabled={loading || googleLoading}
                  isLoading={emailLoading}
                  size="lg"
                  spinner={<Spinner color="default" size="sm" />}
                  type="submit"
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
                <Link isExternal href={tos_doc} underline="always">
                  Terms of Service
                </Link>
              )}{" "}
              and have read our{" "}
              {pp_doc && (
                <Link isExternal href={pp_doc} underline="always">
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
