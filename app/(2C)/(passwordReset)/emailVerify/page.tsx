"use client";

import { ArrowUpRight } from "lucide-react";
import { signIn } from "next-auth/react";
import { Button, cn, Input, Link, Spinner } from "@nextui-org/react";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, ChangeEvent } from "react";
import Turnstile from "react-turnstile";
import { toast } from "react-toastify";

import { useClient } from "@/providers/client-provider";
import { AUTH_METHOD } from "@/lib/admin";
import request from "@/lib/request";

export default function EmailVerify() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState(decodeURIComponent(searchParams.get("email") || ""));
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

    setLoading(true);

    try {
      // 发送验证邮件
      request("/api/password/email-verify", {
        method: "POST",
        body: JSON.stringify({
          email,
          businessDomainId,
          token,
        }),
      })
        .then(() => {
          toast.success("Verification email sent");
          router.push(`/password/reset?email=${encodeURIComponent(email)}`);
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

  return (
    <div className="flex items-center justify-center w-full h-full px-8 -mr-4 space-y-6">
      <div className="max-w-lg">
        <h1 className="font-bold text-3xl mb-12 text-center">Verify Email</h1>

        {/* 邮箱验证表单 */}
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

            <div className="flex justify-between mb-3">
              <div className="text-muted">
                Remember your password?{" "}
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
              Send Verification Email
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
