import { redirect } from "next/navigation";
import Link from "next/link";
import { getSessionRole } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { getKuwaitWeekStart } from "@/lib/date";
import { Icon } from "@/components/icons";
import WeeklyAssignmentForm from "./WeeklyAssignmentForm";

export default async function WeeklyAssignmentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const role = await getSessionRole();
  if (role.kind !== "teacher") redirect("/login");

  const admin = createAdminClient();
  const weekStart = getKuwaitWeekStart();

  const [{ data: student }, { data: existing }] = await Promise.all([
    admin.from("students").select("id, full_name, current_page, review_direction").eq("id", id).single(),
    admin
      .from("weekly_review_assignment")
      .select("from_page, to_page, direction")
      .eq("student_id", id)
      .eq("week_start", weekStart)
      .maybeSingle(),
  ]);

  if (!student) redirect("/teacher");

  const defaultFromPage = existing?.from_page ?? student.current_page ?? 1;
  const defaultToPage = existing?.to_page ?? student.current_page ?? 1;
  const defaultDirection = existing?.direction ?? student.review_direction ?? "forward";

  return (
    <main className="flex min-h-screen flex-col gap-4 p-5" style={{ background: "var(--color-gray-bg)" }}>
      <header className="flex items-center gap-2">
        <Link href={`/teacher/students/${id}`} style={{ color: "var(--color-gray)" }}>
          <Icon.ChevronLeft size={20} />
        </Link>
        <h1 className="text-lg font-bold" style={{ color: "var(--color-text)" }}>
          مقرر مراجعة الأسبوع — {student.full_name}
        </h1>
      </header>

      <section
        className="rounded-2xl bg-white p-4 shadow-sm border"
        style={{ borderColor: "var(--color-border)" }}
      >
        <WeeklyAssignmentForm
          studentId={id}
          defaultWeekStart={weekStart}
          defaultFromPage={defaultFromPage}
          defaultToPage={defaultToPage}
          defaultDirection={defaultDirection}
        />
      </section>
    </main>
  );
}
