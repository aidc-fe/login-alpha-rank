
import { redirect } from "next/navigation";
import { OPERATION_TYPE } from "@/constants/admin";

export default function Page() {
  redirect(`/admin/${OPERATION_TYPE.CREATE}`);
}