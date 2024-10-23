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

        <Input name="name" placeholder="Username" required></Input>
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
        <div className="text-sm text-muted-foreground font-normal flex flex-col gap-3 items-center">
          <div className="text-center">
            By continuing with any of the options above, you agree to our{" "}
            <Button
              onClick={() => {
                window.open(
                  "https://terms.alicdn.com/legal-agreement/terms/b_platform_service_agreement/20231110160335349/20231110160335349.html"
                );
              }}
              variant="link"
              className="p-0 h-fit"
            >
              Terms of Service
            </Button>{" "}
            and have read our{" "}
            <Button
              onClick={() => {
                window.open(
                  "https://terms.alicdn.com/legal-agreement/terms/privacy_policy_full/20231109180939630/20231109180939630.html"
                );
              }}
              variant="link"
              className="p-0 h-fit"
            >
              Privacy Policy
            </Button>{" "}
            .
          </div>
          <div className="flex gap-1">
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
        </div>
      </form>
    </div>
  );
}
