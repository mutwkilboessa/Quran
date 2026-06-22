import { redirect } from "next/navigation";
import Link from "next/link";
import { getSessionRole } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatKuwaitNow } from "@/lib/date";
import { signOut } from "@/lib/actions/sign-out";
import { Icon } from "@/components/icons";
import LiveStatusControl from "./LiveStatusControl";

export default async function TeacherHomePage() {
  const role = await getSessionRole();
  if (role.kind !== "teacher") redirect("/login");

  const admin = createAdminClient();

  const [{ data: settings }, { data: pendingStudents }, { data: students }] = await Promise.all([
    admin
      .from("halaqa_settings")
      .select("halaqa_name, teacher_name, meeting_link, whatsapp_group_link, live_status")
      .eq("id", 1)
      .single(),
    admin.from("pending_students").select("id"),
    admin
      .from("students")
      .select("id, full_name")
      .eq("approval_status", "approved")
      .eq("is_active", true)
      .order("full_name"),
  ]);

  const pendingCount = pendingStudents?.length ?? 0;

  return (
    <main className="flex min-h-screen flex-col gap-4 p-5" style={{ background: "var(--color-gray-bg)" }}>
      <header>
        <h1 className="text-lg font-bold" style={{ color: "var(--color-text)" }}>
          {settings?.halaqa_name ?? "حلقة معاهدة القران الكريم"}
        </h1>
        <p className="text-sm" style={{ color: "var(--color-subtext)" }}>
          {formatKuwaitNow()}
        </p>
      </header>

      <LiveStatusControl
        liveStatus={(settings?.live_status as "not_started" | "live" | "ended") ?? "not_started"}
        meetingLink={settings?.meeting_link ?? null}
      />

      {pendingCount > 0 && (
        <Link
          href="/teacher/pending"
          className="flex items-center justify-between rounded-2xl p-4 shadow-sm"
          style={{ background: "var(--color-red-bg)" }}
        >
          <span className="flex items-center gap-2 text-sm font-bold" style={{ color: "var(--color-red)" }}>
            <Icon.User size={20} />
            {pendingCount} طالب جديد بانتظار التفعيل
          </span>
          <span style={{ color: "var(--color-red)" }}>
            <Icon.ChevronLeft size={18} className="rotate-180" />
          </span>
        </Link>
      )}

      <section
        className="rounded-2xl bg-white p-4 shadow-sm border"
        style={{ borderColor: "var(--color-border)" }}
      >
        <h2 className="mb-3 text-sm font-bold" style={{ color: "var(--color-text)" }}>
          الطلاب ({students?.length ?? 0})
        </h2>
        <div className="flex flex-col divide-y" style={{ borderColor: "var(--color-border)" }}>
          {students?.length ? (
            students.map((s) => (
              <Link
                key={s.id}
                href={`/teacher/students/${s.id}`}
                className="flex items-center justify-between py-3"
              >
                <span className="text-sm" style={{ color: "var(--color-text)" }}>
                  {s.full_name}
                </span>
                <span style={{ color: "var(--color-gray)" }}>
                  <Icon.ChevronLeft size={16} className="rotate-180" />
                </span>
              </Link>
            ))
          ) : (
            <p className="py-2 text-sm" style={{ color: "var(--color-subtext)" }}>
              لا يوجد طلاب مفعّلون بعد.
            </p>
          )}
        </div>
      </section>

      <div className="grid grid-cols-2 gap-3">
        <Link
          href="/teacher/readiness"
          className="flex flex-col items-center justify-center gap-2 rounded-2xl bg-white p-4 shadow-sm border text-sm font-medium"
          style={{ borderColor: "var(--color-border)", color: "var(--color-text)" }}
        >
          <Icon.Calendar size={20} />
          الاستعداد الأسبوعي
        </Link>
        <Link
          href="/teacher/data"
          className="flex flex-col items-center justify-center gap-2 rounded-2xl bg-white p-4 shadow-sm border text-sm font-medium"
          style={{ borderColor: "var(--color-border)", color: "var(--color-text)" }}
        >
          <Icon.Refresh size={20} />
          تسجيل حصة وبيانات
        </Link>
      </div>

      <form action={signOut} className="mt-2">
        <button
          type="submit"
          className="w-full rounded-lg border px-4 py-2.5 text-sm font-medium"
          style={{ borderColor: "var(--color-border)", color: "var(--color-gray)" }}
        >
          تسجيل الخروج
        </button>
      </form>
    </main>
  );
}
