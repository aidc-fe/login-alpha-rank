"use client";
import { CornerUpLeft, Loader } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button, Link } from "@nextui-org/react";

import PasswordInput from "@/components/PasswordInput";

export default function Page() {
  const searchParams = useSearchParams();
  const [_email, setEmail] = useState<string>(decodeURIComponent(searchParams.get("email") || ""));
  const [loading, setLoading] = useState(false);

  return (
    <form
      className="flex flex-col items-center gap-6 h-96 px-8"
      onSubmit={e => {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.target as HTMLFormElement);
        const email = formData.get("email");
      }}
    >
      <h1 className="font-bold text-3xl mb-6">Set password</h1>
      <div className="w-full flex items-center gap-2">
        <strong>Email:</strong>
        {_email}
      </div>

      <PasswordInput
        required
        label="password"
        name="password"
        placeholder="Please enter your password"
      />
      <PasswordInput
        required
        label="Check password"
        name="check_password"
        placeholder="Please enter your password again"
      />
      <div className="flex flex-col lg:grid lg:grid-cols-3 w-full items-center mt-8 gap-4">
        <Button
          className="col-span-2 group"
          color="primary"
          disabled={loading}
          size={"lg"}
          type="submit"
        >
          {loading && <Loader className="text-primary animate-spin" />}
          Set Password
        </Button>
        <Link
          className="flex items-center gap-1 h-auto bg-transparent w-auto min-w-0"
          href={`/?email=${encodeURIComponent(_email)}`}
        >
          <CornerUpLeft size={16} />
          Return to signin
        </Link>
      </div>
    </form>
  );
}
