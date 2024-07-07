"use client";
import { signIn, signOut, useSession } from "next-auth/react";

export default function SignBtn() {
  const { data: session, status } = useSession();

  if (session) {
    return (
      <div>
        <p>{status}</p>
        <p>{JSON.stringify(session)}</p>
        <button
          onClick={() => signOut()}
          className="bg-blue-500 rounded-md text-white px-4 py-1 duration-100 focus:scale-95 hover:scale-110"
        >
          Sign out
        </button>
      </div>
    );
  } else {
    return (
      <div>
        <p>{status}</p>
        <button
          className="bg-blue-500 rounded-md text-white px-4 py-1 duration-100 focus:scale-95 hover:scale-110"
          onClick={() => signIn()}
        >
          Sign in
        </button>
      </div>
    );
  }
}
