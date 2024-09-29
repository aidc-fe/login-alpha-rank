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
    <form
      className="flex flex-col items-center gap-4 px-8"
      onSubmit={handleSubmit}
    >
      <h1 className="font-bold text-3xl mb-2">Set Password</h1>
      <Input
        name="email"
        required
        placeholder="Please enter your email"
        type="email"
        label="email"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
        }}
      />

      <Input
        name="password"
        required
        placeholder="Please enter new password"
        type="password"
        label="password"
      />

      <Input
        name="check_password"
        label="Re-enter password"
        required
        type="password"
        placeholder="Please re-enter new password"
      />
      <div className="flex flex-col mt-8 lg:grid lg:grid-cols-3 w-full items-center gap-4">
        <Button
          className="col-span-2 group"
          variant={"default"}
          size={"lg"}
          type="submit"
          disabled={loading}
        >
          {loading ? (
            <Loader className=" animate-spin" />
          ) : (
            <Send size={20} className="group-hover:rotate-45 duration-150" />
          )}
          Send set instructions
        </Button>
        <Button
          variant={"link"}
          onClick={(e) => {
            e.preventDefault();
            router.replace(`/?email=${encodeURIComponent(email)}`);
          }}
          className="flex items-center gap-1"
        >
          <CornerUpLeft size={16} />
          Return to signin
        </Button>
      </div>
    </form>
  );
}
