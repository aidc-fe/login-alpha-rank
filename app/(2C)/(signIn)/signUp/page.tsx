"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import request from "@/lib/request";
import { CornerUpLeft, Loader } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEventHandler, useState } from "react";

export default function SignUpPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState(
    decodeURIComponent(searchParams.get("email") || "")
  );

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
        targetUrl: searchParams.get("targetUrl"),
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
    <div className="flex items-center justify-center bg-background h-full w-full">
      <form
        className="flex flex-col items-center justify-center gap-4 w-full max-w-lg"
        onSubmit={handleSubmit}
      >
        <h1 className="font-bold text-3xl mb-12">Sign up</h1>

        <Input name="name" placeholder="Name" required></Input>
        <Input
          name="email"
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
          }}
          placeholder="E-mail"
          required
        ></Input>
        <Input
          name="password"
          type="password"
          placeholder="Password"
          required
        ></Input>
        <Button
          className="group w-full"
          variant={"default"}
          type="submit"
          disabled={loading}
        >
          {loading && <Loader className="animate-spin" />}
          Sign up
        </Button>
        <div className="w-1/2 border-b mx-auto" />
        <div className="text-sm text-neutral-400">
          By signing in, you are agreeing to our Privacy Policy and Terms of
          Use.
        </div>
        <div className="text-sm flex gap-1 text-neutral-400">
          <span>Already have an account?</span>
          <Button
            variant={"link"}
            onClick={(e) => {
              e.preventDefault();
              router.replace(`/?email=${encodeURIComponent(email)}`);
            }}
            className="flex items-center gap-1 p-0 h-auto"
          >
            sign in
          </Button>
        </div>
      </form>
    </div>
  );
}
