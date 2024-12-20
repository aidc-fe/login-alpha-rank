"use client";
import Image from "next/image";
import { Button } from "@nextui-org/react";
import { useEffect, useState } from "react";
import { isGmail } from "@/lib/utils";
import { useSearchParams } from "next/navigation";
import { useClient } from "@/providers/client-provider";

export default function EmailSent() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const type = searchParams.get("type") || "login";
  const { support_email } = useClient();

  useEffect(() => {
    setEmail(
      searchParams.get("email") || sessionStorage.getItem("verifyEmail") || ""
    );
  }, [searchParams]);

  return (
    <div className="bg-default-100 h-screen w-screen flex items-center justify-center">
      <div className="bg-white rounded-lg w-5/6 md:w-3/5 shadow-lg p-10">
        <div className="grid grid-cols-[auto,1fr] grid-rows-2">
          <h1 className="md:text-2xl font-medium">
            Check your email for the {type.replace("_", " ")} link.
          </h1>
          <Image
            className="row-span-2 ml-auto"
            src={
              "https://img.icons8.com/?size=100&id=114252&format=png&color=000000"
            }
            width={80}
            height={80}
            alt="email logo"
          ></Image>
          <div className="mt-auto text-sm">{`We've sent a ${type.replace(
            "_",
            " "
          )} confirmation email to:`}</div>
        </div>
        <div className="my-4 font-semibold flex md:items-center flex-col gap-2 md:flex-row justify-between">
          {email}
          {isGmail(email) && (
            <Button
              onClick={() => {
                window.open("https://mail.google.com/mail/u/0/#inbox");
              }}
              startContent={<Image
                height="16"
                width="16"
                alt="google"
                src="https://authjs.dev/img/providers/google.svg"
              />}
            >
              Open Gmail
            </Button>
          )}
        </div>

        <hr />
        <p className="text-muted text-xs my-4">
          Please open this email to complete your {type.replace("_", " ")}.
        </p>
        <p className="text-muted text-xs">
          If you don’t see the email in your inbox within 10 minutes, please
          check your spam folder. If you find it there, mark it as “Not Spam.”
          If you continue to experience login issues, contact us at support
          <Button
            onClick={() => {
              window.open(
                `https://mail.google.com/mail/u/0/?fs=1&to=${support_email}&tf=cm`
              );
            }}
            className="p-0 ml-2 h-auto !bg-transparent w-auto min-w-0"
            color="primary"
            variant="light"
          >
           {support_email}
          </Button>
          .
        </p>
      </div>
    </div>
  );
}
