"use client";

import { Button } from "@nextui-org/react";
import { RocketIcon } from "lucide-react";
import { useRouter } from "next/navigation";

import { Alert, AlertTitle } from "@/components/ui/alert";

export default function PasswordSetSuccess() {
  const router = useRouter();

  return (
    <Alert className="w-4/5 mx-auto">
      <RocketIcon />
      <AlertTitle className="font-semibold text-2xl ml-2 flex flex-col gap-2 lg:flex-row items-center justify-between">
        Succeed set your Password !{" "}
        <Button
          className="w-fit"
          size={"lg"}
          type="submit"
          onClick={() => {
            router.push("/");
          }}
        >
          Sign in
        </Button>
      </AlertTitle>
    </Alert>
  );
}
