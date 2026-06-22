import { redirect } from "next/navigation";
import Link from "next/link";
import { getSessionRole } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { Icon } from "@/components/icons";

export default async function ReadinessPage() {
  const role = await getSessionRole();
  if (role.kind !== "teacher") redirect("/login");

  const admin = createAdminClient();
  const { data: readiness } = await admin
    .from("weekly_review_readiness")
    .select("student_id, full_name, days_reviewed, days_missed, days_not_recorded")
    .order("full_name");

  return (
    <main className="flex min-h-screen flex-col gap-4 p-5" style={{ background: "var(--color-gray-bg)" }}>
      <header className="flex items-center gap-2">
        <Link href="/teacher" style={{ color: "var(--color-gray)" }}>
          <Icon.ChevronLeft size={20} />
        </Link>
        <h1 className="text-lg font-bold" style={{ color: "var(--color-text)" }}>
          الاستعداد الأسبوعي للمراجعة الذاتية
        </h1>
      </header>

      {readiness?.length ? (
        <div className="flex flex-col gap-3">
          {readiness.map((r) => (
            <Link
              key={r.student_id}
              href={`/teacher/students/${r.student_id}`}
              className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm border"
              style={{ borderColor: "var(--color-border)" }}
            >
              <p className="text-sm font-bold" style={{ color: "var(--color-text)" }}>{r.full_name}</p>
              <div className="flex gap-3 text-sm">
                <span style={{ color: "var(--color-green)" }}>✓ {r.days_reviewed}</span>
                <span style={{ color: "var(--color-red)" }}>✗ {r.days_missed}</span>
                <span style={{ color: "var(--color-gray)" }}>○ {r.days_not_recorded}</span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-sm" style={{ color: "var(--color-subtext)" }}>
          لا يوجد طلاب مفعّلون بعد.
        </p>
      )}
    </main>
  );
}
