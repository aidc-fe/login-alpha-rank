"use client";

import { toastApi } from "@/components/ui/toaster";
import request from "@/lib/request";
import { Send } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEventHandler, useState } from "react";
import { Input, Button, Link } from "@nextui-org/react";
import { useClient } from "@/providers/client-provider";
import PasswordInput from "@/components/PasswordInput";

export default function Page() {
  const { businessDomainId,client_id } = useClient();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState<string>(
    decodeURIComponent(searchParams.get("email") || "")
  );
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit: FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const checkPassword = formData.get("check_password") as string;

    // 校验新旧密码
    if (checkPassword !== password) {
      toastApi.error("Password does not match.");
      return;
    }

    setLoading(true);
    request("/api/password/emailVerify", {
      method: "POST",
      body: JSON.stringify({ email, password, businessDomainId, client_id }),
    })
      .then(() => {
        router.push(
          `/email/sent?email=${encodeURIComponent(
            email || ""
          )}&type=set_password`
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
        <h1 className="font-bold text-3xl mb-12">Set Password</h1>
        <Input
          name="email"
          required
          label="E-mail"
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
          }}
        />

        <PasswordInput
          name="password"
          required
          label="Password"
        />

        <PasswordInput
          name="check_password"
          required
          label="Re-enter password"
        />
        <Button
          className="group w-full"
          color="primary"
          type="submit"
          startContent={
            <Send size={20} className="group-hover:rotate-45 duration-150" />
          }
          isLoading={loading}
        >
          Send set instructions
        </Button>
        <div className="w-1/2 border-b mx-auto mt-4" />
        <div className="flex items-center text-muted-foreground gap-2">
          <span>Back to</span>
          <Link
           href={`/?email=${encodeURIComponent(email)}`}
            className="flex items-center gap-1 p-0 h-auto !bg-transparent w-auto min-w-0"
          >
            Sign in
          </Link>
        </div>
      </form>
    </div>
  );
}
