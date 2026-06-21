import { redirect } from "next/navigation";
import { getSessionRole } from "@/lib/auth";
import { signOut } from "@/lib/actions/sign-out";

export default async function TeacherHomePage() {
  const role = await getSessionRole();
  if (role.kind !== "teacher") redirect("/login");

  return (
    <main className="flex min-h-screen flex-col p-6" style={{ background: "var(--color-gray-bg)" }}>
      <h1 className="text-lg font-bold" style={{ color: "var(--color-text)" }}>
        لوحة المعلم
      </h1>
      <p className="mt-2 text-sm" style={{ color: "var(--color-subtext)" }}>
        قيد الإنشاء.
      </p>
      <form action={signOut} className="mt-6">
        <button
          type="submit"
          className="rounded-lg border px-4 py-2 text-sm font-medium"
          style={{ borderColor: "var(--color-border)", color: "var(--color-gray)" }}
        >
          تسجيل الخروج
        </button>
      </form>
    </main>
  );
}
