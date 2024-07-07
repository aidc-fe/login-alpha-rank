"use client";
import { signIn, signOut, useSession } from "next-auth/react";

export default function SignBtn() {
  const { data: session, status } = useSession();

  if (session) {
    return (
      <div>
        <p>{status}</p>
        <p>{JSON.stringify(session)}</p>
        <button onClick={() => signOut()} className="border">
          Sign out
        </button>
      </div>
    );
  } else {
    return (
      <div>
        <p>{status}</p>
        <button className="border" onClick={() => signIn()}>
          Sign in
        </button>
      </div>
    );
  }
}
