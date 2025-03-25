"use client";

import { ArrowUpRight } from "lucide-react";
import { signIn } from "next-auth/react";
import { Button, cn, Input, Link, Spinner } from "@nextui-org/react";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, ChangeEvent } from "react";
import Turnstile from "react-turnstile";
import { toast } from "react-toastify";

import { useClient } from "@/providers/client-provider";
import PasswordInput from "@/components/PasswordInput";
import { AUTH_METHOD } from "@/lib/admin";
import request from "@/lib/request";
import { encryptWithRSA } from "@/lib/rsa";

export default function SignUp() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState(decodeURIComponent(searchParams.get("email") || ""));
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [token, setToken] = useState("");
  const router = useRouter();

  const {
    businessDomainId,
    isSSO,
    redirect_uris,
    client_id,
    pp_doc,
    tos_doc,
    login_methods = [],
  } = useClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      toast.error("Please verify the captcha");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      // 获取公钥
      const response = await fetch("/api/rsa/public-key");
      const { publicKey } = await response.json();

      // 加密密码
      const encryptedPassword = encryptWithRSA(password, publicKey);

      // 注册
      request("/api/signUp", {
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
            callbackUrl: `/api/oauth/authorize/default?redirect_uri=${
              redirect_uris?.[0]
            }&client_id=${client_id}&callbackUrl=${
              window.opener && window.name === "loginWindow"
                ? `${window.location.origin}/popup-login`
                : ""
            }&auth_action=sign_in&userId=${user.sub}`,
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

  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const handleConfirmPasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value);
  };

  return (
    <div className="flex items-center justify-center w-full h-full px-8 -mr-4 space-y-6">
      <div className="max-w-lg">
        <h1 className="font-bold text-3xl mb-12 text-center">Sign up</h1>

        {/* 密码注册表单 */}
        {login_methods.includes(AUTH_METHOD.PASSWORD) && (
          <form className="flex flex-col justify-between gap-4" onSubmit={handleSubmit}>
            <Input
              id="email"
              label={<label htmlFor="email">邮箱</label>}
              value={email}
              onChange={handleEmailChange}
              placeholder="请输入邮箱"
              required
              type="email"
            />
            <PasswordInput
              id="password"
              label={<label htmlFor="password">密码</label>}
              value={password}
              onChange={handlePasswordChange}
              placeholder="请输入密码"
              required
            />
            <PasswordInput
              id="confirm-password"
              label={<label htmlFor="confirm-password">确认密码</label>}
              value={confirmPassword}
              onChange={handleConfirmPasswordChange}
              placeholder="请再次输入密码"
              required
            />

            <div className="flex justify-between mb-3">
              <div className="text-muted">
                Already have an account?{" "}
                <Link
                  href={`/signIn?email=${encodeURIComponent(email)}`}
                  isDisabled={loading}
                  underline="always"
                >
                  Sign in
                </Link>
              </div>
            </div>

            <Turnstile
              className="mx-auto"
              refreshExpired="auto"
              sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
              onVerify={token => setToken(token)}
            />

            <Button
              color="primary"
              isDisabled={loading}
              isLoading={loading}
              size="lg"
              spinner={<Spinner color="default" size="sm" />}
              type="submit"
            >
              Sign up
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
