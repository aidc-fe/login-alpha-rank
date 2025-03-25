"use client";

import { Send } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEventHandler, useState } from "react";
import { Input, Button, Link, Spinner } from "@nextui-org/react";
import { toast } from "react-toastify";
import Turnstile from "react-turnstile";

import { useClient } from "@/providers/client-provider";
import PasswordInput from "@/components/PasswordInput";
import request from "@/lib/request";

export default function Page() {
  const { businessDomainId, client_id } = useClient();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState<string>(decodeURIComponent(searchParams.get("email") || ""));
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState("");
  const router = useRouter();

  const handleSubmit: FormEventHandler<HTMLFormElement> = e => {
    e.preventDefault();

    if (!token) {
      toast.error("Please verify the captcha");

      return;
    }

    const formData = new FormData(e.target as HTMLFormElement);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const checkPassword = formData.get("check_password") as string;

    // 校验新旧密码
    if (checkPassword !== password) {
      toast.error("Password does not match.");

      return;
    }

    setLoading(true);
    request("/api/password/emailVerify", {
      method: "POST",
      body: JSON.stringify({ email, password, businessDomainId, client_id, token }),
    })
      .then(() => {
        router.push(`/email/sent?email=${encodeURIComponent(email || "")}&type=set_password`);
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
        <h1 className="font-bold text-3xl mb-12">Set Password</h1>
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

        <PasswordInput required label="Re-enter password" name="check_password" />
        <Turnstile
          refreshExpired="auto"
          sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
          onVerify={token => setToken(token)} // 验证成功后获取 token
        />
        <Button
          className="group w-full"
          color="primary"
          isLoading={loading}
          size="lg"
          spinner={<Spinner color="default" size="sm" />}
          startContent={
            !loading && <Send className="group-hover:rotate-45 duration-150" size={20} />
          }
          type="submit"
        >
          Send set instructions
        </Button>
        <div className="w-1/2 border-b mx-auto mt-4" />
        <div className="flex items-center text-muted gap-2">
          <span>Back to</span>
          <Link href={`/?email=${encodeURIComponent(email)}`} underline="always">
            Sign in
          </Link>
        </div>
      </form>
    </div>
  );
}
