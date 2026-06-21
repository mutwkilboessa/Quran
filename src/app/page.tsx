import { redirect } from "next/navigation";
import { getSessionRole } from "@/lib/auth";

export default async function RootPage() {
  const role = await getSessionRole();

  if (role.kind === "anonymous") redirect("/login");
  if (role.kind === "teacher") redirect("/teacher");
  if (role.kind === "approved") redirect("/student");
  redirect("/pending");
}
