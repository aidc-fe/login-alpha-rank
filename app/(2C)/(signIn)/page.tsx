"use client";

import request from "@/lib/request";
import { ArrowUpRight } from "lucide-react";
import { signIn, useSession } from "next-auth/react";
import { Button, Input, Link } from '@nextui-org/react'
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useClient } from "@/providers/client-provider";
import { Session } from "next-auth";
import PasswordInput from "@/components/PasswordInput";

export default function Home() {
  const { status, data } = useSession() as { 
    status: 'loading'|'authenticated'|'unauthenticated', 
    data: Session & { id: string } | null };
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [email, setEmail] = useState(
    decodeURIComponent(searchParams.get("email") || "")
  );
  const [jumpEmail, setJumpEmail] = useState("");
  const targetUrl = decodeURIComponent(searchParams.get("targetUrl") || "");
  const router = useRouter();
  const [callbackUrl, setCallbackUrl]=useState("");
  const { businessDomainId, isSSO, redirect_uris, client_id, pp_doc, tos_doc} = useClient();

  // 根据是否是单点登录，判断登录后跳转的页面
  useEffect(()=>{
    if(isSSO === undefined){ 
      return;
    } else if(isSSO){
      setCallbackUrl(`/login-landing-page?${
      targetUrl ? "targetUrl=" + targetUrl : ""
    }`);
    } else {
      setCallbackUrl(`/api/oauth/authorize/default?redirect_uri=${redirect_uris?.[0]}&client_id=${client_id}&userId=${data?.id}`);
    }
  },[isSSO])

  // 如果用户已经登录，则进行续登
  useEffect(() => {
    if (status === "authenticated") {
      if(isSSO) {
        router.replace(`/login-landing-page${location.search}`);
      } else {
        router.replace(`/api/oauth/authorize/default?redirect_uri=${redirect_uris?.[0]}&client_id=${client_id}&userId=${data?.id}`);
      }
    }
  }, [router, status, data, isSSO, redirect_uris, client_id, callbackUrl]);

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
                  body: JSON.stringify({ email, password, businessDomainId }),
                })
                  .then((user) => {
                    signIn("password", { ...user, callbackUrl:`${callbackUrl}&userId=${user.sub}`, businessDomainId});
                  })
                  .finally(() => {
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
                onChange={(e) => {
                  setEmail(e.target.value);
                }}
              />
              <PasswordInput
                name="password"
                label="Password"
                required
              />

              <div className="flex justify-between">
                <Link showAnchorIcon anchorIcon={<ArrowUpRight
                  className="group-hover:rotate-45 duration-150"
                  size={20}
                  />} 
                className="group" 
                href={`/password/emailVerify?email=${encodeURIComponent(email)}`}>
                  Forgot your password{" "}
                </Link>
                <div className="text-muted-foreground">
                  Not a member?{" "}
                  <Link
                    href={`/signUp?email=${encodeURIComponent(email)}`}
                    isDisabled={loading || emailLoading}
                  >
                    Sign up
                  </Link>
                </div>
              </div>

              <Button
                color="primary"
                type="submit"
                isLoading={loading}
                disabled={emailLoading}
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
              className="w-full"
              radius="sm"
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
            <form
              className="flex py-4 gap-3 items-center"
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
                name="email"
                required
                label={
                  "Enter email address for Magic Link Authentication"
                }
                type="email"
                value={jumpEmail}
                onChange={(e) => {
                  setJumpEmail(e.target.value);
                }}
              />
              <Button color="primary" type="submit" isLoading={emailLoading} isDisabled={loading}>
                Sign in
              </Button>
            </form>
            <div className="w-1/2 border-b mx-auto mt-4" />
            <div className="w-full text-muted-foreground font-normal text-center mt-4">
              By continuing with any of the options above, you agree to our{" "}
             {tos_doc && <Link
                href={tos_doc}
                isExternal
                underline="always"
              >
                Terms of Service
              </Link>}{" "}
              and have read our{" "}
              {pp_doc && <Link
                href={pp_doc}
                isExternal
                underline="always"
              >
                Privacy Policy
              </Link>}{" "}
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
