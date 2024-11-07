
import { redirect } from "next/navigation";
import { OPERATION_TYPE } from "@/lib/admin";

export default function Page() {
  redirect(`/admin/list/${OPERATION_TYPE.CREATE}`);
}