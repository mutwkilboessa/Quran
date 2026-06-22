import { redirect } from "next/navigation";
import Link from "next/link";
import { getSessionRole } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatKuwaitDateTime } from "@/lib/date";
import { Icon } from "@/components/icons";
import ApproveForm from "./ApproveForm";

export default async function PendingStudentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const role = await getSessionRole();
  if (role.kind !== "teacher") redirect("/login");

  const admin = createAdminClient();

  const [{ data: student }, { data: surahs }] = await Promise.all([
    admin
      .from("students")
      .select("id, full_name, email, phone, joined_at")
      .eq("id", id)
      .single(),
    admin.from("surahs").select("number, name").order("number"),
  ]);

  if (!student) redirect("/teacher/pending");

  return (
    <main className="flex min-h-screen flex-col gap-4 p-5" style={{ background: "var(--color-gray-bg)" }}>
      <header className="flex items-center gap-2">
        <Link href="/teacher/pending" style={{ color: "var(--color-gray)" }}>
          <Icon.ChevronLeft size={20} />
        </Link>
        <h1 className="text-lg font-bold" style={{ color: "var(--color-text)" }}>
          تفعيل طالب
        </h1>
      </header>

      <section
        className="rounded-2xl bg-white p-4 shadow-sm border flex flex-col gap-1.5"
        style={{ borderColor: "var(--color-border)" }}
      >
        <p className="text-base font-bold" style={{ color: "var(--color-text)" }}>
          {student.full_name}
        </p>
        <p className="text-sm" style={{ color: "var(--color-subtext)" }} dir="ltr">
          {student.email}
        </p>
        {student.phone && (
          <p className="text-sm" style={{ color: "var(--color-subtext)" }} dir="ltr">
            {student.phone}
          </p>
        )}
        <p className="text-xs" style={{ color: "var(--color-gray)" }}>
          تاريخ التسجيل: {formatKuwaitDateTime(student.joined_at)}
        </p>
      </section>

      <ApproveForm studentId={student.id} surahs={surahs ?? []} />
    </main>
  );
}
