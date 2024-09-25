"use client";

import request from "@/lib/request";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function EmailVerify() {
  const { token } = useParams();
  const [error, setError] = useState();

  useEffect(() => {
    request("/api/email/verify", {
      method: "POST",
      body: JSON.stringify({ token }),
    })
      .then((res) => {})
      .catch((e) => {
        setError(e?.message);
      });
  }, []);

  return <div></div>;
}
