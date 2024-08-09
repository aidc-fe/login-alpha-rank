"use client";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

export default function EmailVerify() {
  const [email, setEmail] = useState("");

  useEffect(() => {
    setEmail(sessionStorage.getItem("verifyEmail") || "");
  }, []);
  return (
    <div className="bg-muted h-screen w-screen flex items-center justify-center">
      <div className="bg-white rounded-lg w-3/5 shadow-lg p-10">
        <div className="grid grid-cols-[auto,1fr] grid-rows-2">
          <h1 className="md:text-2xl font-medium">
            Check your email for the login link.
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
          <div className="mt-auto text-sm">{`We've sent a login confirmation email to:`}</div>
        </div>
        <div className="my-4 font-semibold">{email}</div>
        <hr />
        <p className="text-muted-foreground text-xs my-4">
          Please open this email to complete your login.
        </p>
        <p className="text-muted-foreground text-xs">
          If you don’t see the email in your inbox within 10 minutes, please
          check your spam folder. If you find it there, mark it as “Not Spam.”
          If you continue to experience login issues, contact us at support
          <Button
            onClick={() => {
              window.open(
                "https://mail.google.com/mail/u/0/?fs=1&to=support@alpha-rank.com&tf=cm"
              );
            }}
            className="p-0 ml-2 h-fit"
            variant={"link"}
          >
            support@alpha-rank
          </Button>
          .
        </p>
      </div>
    </div>
  );
}
