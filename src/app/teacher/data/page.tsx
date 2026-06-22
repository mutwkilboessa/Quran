import { redirect } from "next/navigation";
import Link from "next/link";
import { getSessionRole } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { getKuwaitDateString } from "@/lib/date";
import { Icon } from "@/components/icons";
import ImportForm from "./ImportForm";

export default async function DataPage() {
  const role = await getSessionRole();
  if (role.kind !== "teacher") redirect("/login");

  const admin = createAdminClient();
  const today = getKuwaitDateString();

  const { data: lastSession } = await admin
    .from("sessions")
    .select("halaqa_number")
    .order("halaqa_number", { ascending: false })
    .limit(1)
    .maybeSingle();

  const nextHalaqaNumber = (lastSession?.halaqa_number ?? 0) + 1;

  return (
    <main className="flex min-h-screen flex-col gap-4 p-5" style={{ background: "var(--color-gray-bg)" }}>
      <header className="flex items-center gap-2">
        <Link href="/teacher" style={{ color: "var(--color-gray)" }}>
          <Icon.ChevronLeft size={20} />
        </Link>
        <h1 className="text-lg font-bold" style={{ color: "var(--color-text)" }}>
          تسجيل حصة وبيانات
        </h1>
      </header>

      <section
        className="rounded-2xl bg-white p-4 shadow-sm border flex flex-col gap-3"
        style={{ borderColor: "var(--color-border)" }}
      >
        <h2 className="text-sm font-bold" style={{ color: "var(--color-text)" }}>
          الخطوة 1: تحميل قالب الحصة
        </h2>
        <p className="text-sm" style={{ color: "var(--color-subtext)" }}>
          يحتوي القالب على أسماء الطلاب المفعّلين ونقطة حفظهم الحالية. عبّئ النطاق والحالة لكل طالب ثم
          ارفع الملف في الخطوة الثانية.
        </p>
        <a
          href={`/teacher/data/export?date=${today}&type=tasmee&number=${nextHalaqaNumber}`}
          className="flex items-center justify-center gap-2 rounded-lg border py-2.5 text-sm font-medium"
          style={{ borderColor: "var(--color-border)", color: "var(--color-text)" }}
        >
          <Icon.Book size={16} />
          تحميل قالب Excel
        </a>
      </section>

      <section
        className="rounded-2xl bg-white p-4 shadow-sm border flex flex-col gap-3"
        style={{ borderColor: "var(--color-border)" }}
      >
        <h2 className="text-sm font-bold" style={{ color: "var(--color-text)" }}>
          الخطوة 2: رفع الملف المعبّأ
        </h2>
        <ImportForm defaultSessionDate={today} defaultHalaqaNumber={nextHalaqaNumber} />
      </section>
    </main>
  );
}
