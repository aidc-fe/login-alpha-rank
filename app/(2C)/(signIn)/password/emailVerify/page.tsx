"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toastApi } from "@/components/ui/toaster";
import request from "@/lib/request";
import { CornerUpLeft, Loader, Send } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEventHandler, useState } from "react";

export default function Page() {
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
      body: JSON.stringify({ email, password }),
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
    <div className="flex items-center justify-center bg-background h-full w-full">
      <form
        className="flex flex-col items-center justify-center gap-4 w-full max-w-lg"
        onSubmit={handleSubmit}
      >
        <h1 className="font-bold text-3xl mb-12">Set Password</h1>
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

        <Input
          name="check_password"
          required
          type="password"
          placeholder="Re-enter password"
        />
        <Button
          className="group w-full"
          variant={"default"}
          type="submit"
          icon={<Send size={20} className="group-hover:rotate-45 duration-150" />}
          loading={loading}
        >
          Send set instructions
        </Button>
        <div className="w-1/2 border-b mx-auto mt-4" />
        <div className="flex text-sm text-muted-foreground gap-1">
          <span>Back to</span>
          <Button
            variant={"link"}
            onClick={(e) => {
              e.preventDefault();
              router.replace(`/?email=${encodeURIComponent(email)}`);
            }}
            className="flex items-center gap-1 p-0 h-auto"
          >
            Sign in
          </Button>
        </div>
      </form>
    </div>
  );
}
