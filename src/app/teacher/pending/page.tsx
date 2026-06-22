import { redirect } from "next/navigation";
import Link from "next/link";
import { getSessionRole } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { Icon } from "@/components/icons";

export default async function PendingListPage() {
  const role = await getSessionRole();
  if (role.kind !== "teacher") redirect("/login");

  const admin = createAdminClient();
  const { data: pending } = await admin
    .from("pending_students")
    .select("id, full_name, email, phone, joined_at")
    .order("joined_at");

  return (
    <main className="flex min-h-screen flex-col gap-4 p-5" style={{ background: "var(--color-gray-bg)" }}>
      <header className="flex items-center gap-2">
        <Link href="/teacher" style={{ color: "var(--color-gray)" }}>
          <Icon.ChevronLeft size={20} />
        </Link>
        <h1 className="text-lg font-bold" style={{ color: "var(--color-text)" }}>
          طلاب بانتظار التفعيل
        </h1>
      </header>

      {pending?.length ? (
        <div className="flex flex-col gap-3">
          {pending.map((p) => (
            <Link
              key={p.id}
              href={`/teacher/pending/${p.id}`}
              className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm border"
              style={{ borderColor: "var(--color-border)" }}
            >
              <div>
                <p className="text-sm font-bold" style={{ color: "var(--color-text)" }}>
                  {p.full_name}
                </p>
                <p className="text-xs" style={{ color: "var(--color-subtext)" }} dir="ltr">
                  {p.email}
                </p>
              </div>
              <span style={{ color: "var(--color-gray)" }}>
                <Icon.ChevronLeft size={16} className="rotate-180" />
              </span>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-sm" style={{ color: "var(--color-subtext)" }}>
          لا يوجد طلاب جدد بانتظار التفعيل حالياً.
        </p>
      )}
    </main>
  );
}
