"use client";

import { Input, Button, Link, Spinner } from "@nextui-org/react";
import Image from "next/image";
import request from "@/lib/request";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEventHandler, useEffect, useState } from "react";
import { useClient } from "@/providers/client-provider";
import PasswordInput from "@/components/PasswordInput";

export default function SignUpPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState(
    decodeURIComponent(searchParams.get("email") || "")
  );
  const targetUrl = decodeURIComponent(searchParams.get("targetUrl") || "");
  const [callbackUrl, setCallbackUrl] = useState("");
  
  const { businessDomainId, isSSO, redirect_uris, client_id, pp_doc, tos_doc, url } =
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
      const invite = sessionStorage.getItem("invite");
      const loginReferral = sessionStorage.getItem("loginReferral");
      setCallbackUrl(
        `/api/oauth/authorize/default?redirect_uri=${redirect_uris?.[0]}&client_id=${client_id}${targetUrl ? `&callbackUrl=${targetUrl}` : ""}&auth_action=sign_up${invite ? `&invite=${invite}` : ""}${loginReferral ? `&loginReferral=${loginReferral}` : ""}`
      );
    }
  }, [isSSO]);

  useEffect(() => {
    
    // 查找或创建 canonical link 标签
    let link = document.querySelector("link[rel='canonical']");
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      document.head.appendChild(link);
    }
    
    // 更新 canonical URL
    link.setAttribute('href', `${url}/signUp`);
  }, []); // 空数组表示只有在组件挂载时运行一次

  const handleSubmit: FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.target as HTMLFormElement);
    const name = formData.get("name");
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    // 发送验证邮件
    request("/api/signUp/email/send", {
      method: "POST",
      body: JSON.stringify({
        name,
        email,
        password,
        targetUrl: callbackUrl,
        businessDomainId,
        client_id,
      }),
    })
      .then(() => {
        router.push(
          `/email/sent?email=${encodeURIComponent(email || "")}&type=sign_up`
        );
      })
      .catch((err) => {
        console.log({ err });
      })
      .finally(() => {
        setLoading(false);
      });
  };
  return (
    <div className="flex items-center justify-center h-full w-full">
      <form
        className="flex flex-col items-center justify-center gap-4 w-full max-w-lg"
        onSubmit={handleSubmit}
      >
        <h1 className="font-bold text-3xl mb-12">Sign up</h1>

        <Input name="name" label="Username" required></Input>
        <Input
          name="email"
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
          }}
          label="E-mail"
          required
        ></Input>
        <PasswordInput name="password" label="Password" required />
        <Button
          className="w-full"
          color="primary"
          type="submit"
          spinner={<Spinner color="default" size="sm" />}
          size="lg"
          disabled={loading}
          isLoading={loading}
        >
          Sign up
        </Button>
        <div className="w-full flex items-center text-muted">
          <div className="bg-muted/60 h-[1px] w-full" />
          <span className="px-8 text-input text-sm">or</span>
          <div className="bg-muted/60 h-[1px] w-full" />
        </div>
        <Button
          className="w-full"
          size="lg"
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
        <div className="w-1/2 border-b mx-auto mt-4" />
        <div className="text-muted font-normal flex flex-col gap-3 items-center">
          <div className="text-center">
            By continuing with any of the options above, you agree to our{" "}
            {tos_doc && (
              <Link underline="always" isExternal href={tos_doc}>
                Terms of Service
              </Link>
            )}{" "}
            and have read our{" "}
            {pp_doc && (
              <Link underline="always" isExternal href={pp_doc}>
                Privacy Policy
              </Link>
            )}
            .
          </div>
          <div className="flex gap-1 items-center">
            <span>Already have an account?</span>
            <Link
              underline="always"
              href={`/?email=${encodeURIComponent(email)}&targetUrl=${targetUrl}`}
            >
              sign in
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}
