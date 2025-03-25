"use client";

import { Input, Button, Link, Spinner } from "@nextui-org/react";
import Image from "next/image";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEventHandler, useEffect, useState } from "react";
import Turnstile from "react-turnstile";
import { toast } from "react-toastify";

import { useClient } from "@/providers/client-provider";
import PasswordInput from "@/components/PasswordInput";
import request from "@/lib/request";
import { encryptWithRSA } from "@/lib/rsa";

export default function SignUpPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState(decodeURIComponent(searchParams.get("email") || ""));
  const targetUrl = decodeURIComponent(searchParams.get("targetUrl") || "");
  const [callbackUrl, setCallbackUrl] = useState("");
  const [token, setToken] = useState("");

  const { businessDomainId, isSSO, redirect_uris, client_id, pp_doc, tos_doc, url } = useClient();

  // 根据是否是单点登录，判断登录后跳转的页面
  useEffect(() => {
    if (isSSO === undefined) {
      return;
    } else if (isSSO) {
      setCallbackUrl(`/login-landing-page?${targetUrl ? "targetUrl=" + targetUrl : ""}`);
    } else {
      const invite = sessionStorage.getItem("invite");

      setCallbackUrl(
        `/api/oauth/authorize/default?redirect_uri=${redirect_uris?.[0]}&client_id=${client_id}&auth_action=sign_up${invite ? `&invite=${invite}` : ""}`
      );
    }
  }, [isSSO]);

  useEffect(() => {
    // 查找或创建 canonical link 标签
    let link = document.querySelector("link[rel='canonical']");

    if (!link) {
      link = document.createElement("link");
      link.setAttribute("rel", "canonical");
      document.head.appendChild(link);
    }

    // 更新 canonical URL
    link.setAttribute("href", `${url}/signUp`);
  }, []); // 空数组表示只有在组件挂载时运行一次

  const handleSubmit: FormEventHandler<HTMLFormElement> = async e => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const name = formData.get("name");
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!token) {
      toast.error("Please verify the captcha");
      return;
    }

    setLoading(true);
    // 获取公钥
    const response = await fetch("/api/rsa/public-key");
    const { publicKey } = await response.json();

    // 加密密码
    const encryptedPassword = encryptWithRSA(password, publicKey);

    // 发送验证邮件
    request("/api/signUp/email/send", {
      method: "POST",
      body: JSON.stringify({
        name,
        email,
        password: encryptedPassword,
        targetUrl: callbackUrl,
        businessDomainId,
        client_id,
        token,
      }),
    })
      .then(() => {
        router.push(`/email/sent?email=${encodeURIComponent(email || "")}&type=sign_up`);
      })
      .catch(err => {
        console.log({ err });
        window.location.reload();
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

        <Input required label="Username" name="name" />
        <Input
          required
          label="E-mail"
          name="email"
          type="email"
          value={email}
          onChange={e => {
            setEmail(e.target.value);
          }}
        />
        <PasswordInput required label="Password" name="password" />
        <Turnstile
          refreshExpired="auto"
          sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
          onVerify={token => setToken(token)} // 验证成功后获取 token
        />

        <Button
          className="w-full"
          color="primary"
          disabled={loading}
          isLoading={loading}
          size="lg"
          spinner={<Spinner color="default" size="sm" />}
          type="submit"
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
          onClick={() => signIn("google", { callbackUrl: `${callbackUrl}&auth_type=google` })}
        >
          <Image
            alt="provider-logo-dark"
            height="24"
            src="https://authjs.dev/img/providers/google.svg"
            width="24"
          />
          Google
        </Button>
        <div className="w-1/2 border-b mx-auto mt-4" />
        <div className="text-muted font-normal flex flex-col gap-3 items-center">
          <div className="text-center">
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
            )}
            .
          </div>
          <div className="flex gap-1 items-center">
            <span>Already have an account?</span>
            <Link href={`/?email=${encodeURIComponent(email)}`} underline="always">
              sign in
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}
