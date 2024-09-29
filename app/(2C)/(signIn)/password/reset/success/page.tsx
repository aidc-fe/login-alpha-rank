"use client";

import { Alert, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { RocketIcon } from "lucide-react";
import { useRouter } from "next/navigation";

export default function PasswordSetSuccess() {
  const router = useRouter();

  return (
    <Alert className="w-4/5 mx-auto">
      <RocketIcon />
      <AlertTitle className="font-semibold text-2xl ml-2 flex flex-col gap-2 lg:flex-row items-center justify-between">
        Succeed set your Password !{" "}
        <Button
          onClick={() => {
            router.push("/");
          }}
          size={"lg"}
          type="submit"
          className="w-fit"
        >
          Sign in
        </Button>
      </AlertTitle>
    </Alert>
  );
}
