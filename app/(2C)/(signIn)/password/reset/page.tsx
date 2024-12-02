"use client";
import { CornerUpLeft, Loader, Send } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button, Input, Link } from "@nextui-org/react";

export default function Page() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState<string>(
    decodeURIComponent(searchParams.get("email") || "")
  );
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  return (
    <form
      className="flex flex-col items-center gap-6 h-96 px-8"
      onSubmit={(e) => {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.target as HTMLFormElement);
        const email = formData.get("email");
      }}
    >
      <h1 className="font-bold text-3xl mb-6">Set password</h1>
      <div className="w-full flex items-center gap-2">
        <strong>Email:</strong>
        {email}
      </div>

      <Input
        name="password"
        label="password"
        required
        placeholder="Please enter your password"
        type="password"
      />
      <Input
        name="check_password"
        label="Check password"
        required
        placeholder="Please enter your password again"
        type="password"
      />
      <div className="flex flex-col lg:grid lg:grid-cols-3 w-full items-center mt-8 gap-4">
        <Button
          className="col-span-2 group"
          color="primary"
          size={"lg"}
          type="submit"
          disabled={loading}
        >
          {loading && <Loader className="text-primary animate-spin" />}
          Set Password
        </Button>
        <Link
        href={`/?email=${encodeURIComponent(email)}`}
          className="flex items-center gap-1 h-auto bg-transparent w-auto min-w-0"
        >
          <CornerUpLeft size={16} />
          Return to signin
        </Link>
      </div>
    </form>
  );
}
