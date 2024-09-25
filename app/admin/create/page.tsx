"use client";

import { Button } from "@/components/ui/button";
import request from "@/lib/request";

export default function AdminCreatePage() {
  return (
    <div>
      <Button
        onClick={() => {
          request("/api/client", { method: "POST", body: "{}" });
        }}
      >
        create
      </Button>
    </div>
  );
}
