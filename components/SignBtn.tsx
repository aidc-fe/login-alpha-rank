"use client";
import { signIn, signOut, useSession } from "next-auth/react";
import { Loader } from "lucide-react";
import { cn } from "@/utils/className";
import { useSearchParams } from "next/navigation";

export default function SignBtn() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const host = searchParams.get("host");

  return (
    <div className="flex flex-col gap-4">
      <button
        onClick={() => {
          signIn("email");
        }}
      >
        邮箱登录
      </button>
      <p>{searchParams.get("host")}</p>
      <p>{status}</p>
      <p>{JSON.stringify(session)}</p>

      {/* <form
        onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.target as HTMLFormElement);
          signIn("email", { email: formData.get("email") });
        }}
        className="flex gap-2 items-center"
      >
        <input
          className=" outline-none px-2 py-1 rounded-lg w-80 focus:ring"
          required
          name="email"
          type="email"
        />
        <button className="bg-green-600 py-1 px-2 rounded-lg text-white hover:scale-105 focus:scale-95">
          Sign in with Email
        </button>
      </form> */}
      <button
        onClick={() => (session ? signOut() : signIn("google"))}
        className={cn(
          "w-fit flex gap-2 items-center bg-blue-500 rounded-md text-white px-4 py-1 duration-100 focus:scale-95 hover:scale-110",
          { "opacity-50 pointer-events-none": status === "loading" }
        )}
      >
        {status === "loading" && <Loader className="animate-spin" size="18" />}
        {session ? "Sign out" : "Sigh in"}
      </button>
    </div>
  );
}
