"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ERROR_CONFIG } from "@/constants/errors";
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
    const password = formData.get("password");

    request("/api/signUp/email/send", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    })
      .then((res) => {
        console.log(res);
        router.push(
          `/auth/email/verify?email=${encodeURIComponent(
            email || ""
          )}&type=sign_up`
        );
      })
      .catch((err) => {
        console.log(11, { err });
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
      <h1 className="font-bold text-3xl mb-2">Sign up</h1>

      <Input
        name="name"
        label="name"
        placeholder="Please enter your name"
        required
      ></Input>
      <Input
        name="email"
        type="email"
        label="email"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
        }}
        placeholder="Please enter your email"
        required
      ></Input>
      <Input
        label="password"
        name="password"
        type="password"
        placeholder="Please enter your password"
        required
      ></Input>

      <div className="flex flex-col mt-2 lg:grid lg:grid-cols-3 w-full items-center gap-4">
        <Button
          className="col-span-2 group"
          variant={"default"}
          size={"lg"}
          type="submit"
          disabled={loading}
        >
          {loading && <Loader className="animate-spin" />}
          Sign up
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
