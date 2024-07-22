"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { signIn, signOut, useSession } from "next-auth/react";
import Image from "next/image";
import { useEffect, useMemo } from "react";

const callbackUrl = `/login-landing-page`;
const btnClass =
  "flex items-center justify-center py-4 gap-4 w-full bg-gradient-to-br relative group/btn from-black dark:from-zinc-900 dark:to-zinc-900 to-neutral-600 block dark:bg-zinc-800 text-white rounded-lg font-medium shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:shadow-[0px_1px_0px_0px_var(--zinc-800)_inset,0px_-1px_0px_0px_var(--zinc-800)_inset]";

export default function Home() {
  const { data: session, status } = useSession();

  useEffect(() => {
    console.log(session, status);
  }, [status, session]);

  const content = useMemo(() => {
    switch (status) {
      case "authenticated":
        return (
          <button
            onClick={() => {
              signOut();
            }}
            className={btnClass}
          >
            <span className="text-neutral-700 text-lg font-medium dark:text-neutral-300">
              Sigh Out
            </span>
            <BottomGradient />
          </button>
        );
      case "unauthenticated":
        return (
          <>
            <button
              onClick={() => signIn("google", { callbackUrl })}
              className={btnClass}
            >
              <Image
                height="24"
                width="24"
                alt="provider-logo-dark"
                src="https://authjs.dev/img/providers/google.svg"
              ></Image>
              {/* <IconBrandGoogle className=" text-neutral-800 dark:text-neutral-300" /> */}
              <span className="text-neutral-700 text-lg font-medium dark:text-neutral-300">
                Google
              </span>
              <BottomGradient />
            </button>

            <div className="bg-gradient-to-r from-transparent via-neutral-300 dark:via-neutral-700 to-transparent my-8 h-[1px] w-full" />

            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target as HTMLFormElement);
                const email = formData.get("email");
                signIn("email", { email, callbackUrl });
              }}
            >
              <LabelInputContainer>
                {/* <Label htmlFor="Shopify Shop Domain">Shopify Shop Domain</Label> */}
                <Input
                  name="email"
                  required
                  id="email"
                  placeholder="Please enter your email"
                  type="email"
                />
              </LabelInputContainer>

              <button className={btnClass} type="submit">
                <Image
                  src={
                    "https://img.icons8.com/?size=100&id=44829&format=png&color=000000"
                  }
                  width={28}
                  height={28}
                  alt="shopify login logo"
                ></Image>
                <span className="text-neutral-700 text-lg font-medium dark:text-neutral-300">
                  Email
                </span>
                <BottomGradient />
              </button>
            </form>

            <div className="bg-gradient-to-r from-transparent via-neutral-300 dark:via-neutral-700 to-transparent my-8 h-[1px] w-full" />

            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target as HTMLFormElement);
                const shopDomain = formData.get("shopDomain");
                if (!shopDomain) {
                  return;
                }
                window.location.href = `${process.env.NEXT_PUBLIC_NEXT_AUTH_URL}/shopify/auth?shopDomain=${shopDomain}`;
              }}
            >
              <LabelInputContainer>
                <Label htmlFor="Shopify Shop Domain">Shopify Shop Domain</Label>
                <Input
                  name="shopDomain"
                  required
                  id="Shopify Shop Domain"
                  placeholder="e.g. f3f8a8-4.myshopify.com"
                  type="text"
                />
              </LabelInputContainer>

              <button className={btnClass} type="submit">
                <Image
                  src={
                    "https://img.icons8.com/?size=100&id=uSHYbs6PJfMT&format=png&color=000000"
                  }
                  width={28}
                  height={28}
                  alt="shopify login logo"
                ></Image>
                <span className="text-neutral-700 text-lg font-medium dark:text-neutral-300">
                  Shopify
                </span>
                <BottomGradient />
              </button>
            </form>
          </>
        );
      case "loading":
        return <div>loading</div>;
    }
  }, [status]);
  return (
    <main className="h-full flex flex-col justify-center items-center ">
      <div className=" whitespace-break-spaces break-words w-full px-8">
        {JSON.stringify(session)}
      </div>

      <div className="w-3/5 space-y-8">{content}</div>
    </main>
  );
}

const BottomGradient = () => {
  return (
    <>
      <span className="group-hover/btn:opacity-100 block transition duration-500 opacity-0 absolute h-px w-full -bottom-px inset-x-0 bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
      <span className="group-hover/btn:opacity-100 blur-sm block transition duration-500 opacity-0 absolute h-px w-1/2 mx-auto -bottom-px inset-x-10 bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
    </>
  );
};

const LabelInputContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn("flex flex-col space-y-2 w-full", className)}>
      {children}
    </div>
  );
};
