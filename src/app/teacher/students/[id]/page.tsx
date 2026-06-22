import { redirect } from "next/navigation";
import Link from "next/link";
import { getSessionRole } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { getKuwaitDateString, formatKuwaitDateTime } from "@/lib/date";
import { STATUS_LABEL, STATUS_COLOR, type ReportStatus } from "@/lib/reportStatus";
import { Icon } from "@/components/icons";
import PrintButton from "./PrintButton";

export default async function StudentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const role = await getSessionRole();
  if (role.kind !== "teacher") redirect("/login");

  const admin = createAdminClient();
  const today = getKuwaitDateString();

  const [
    { data: student },
    { data: surahs },
    { data: tasmeeRows },
    { data: todayReview },
    { data: latestReport },
    { data: readiness },
    { data: recentReports },
  ] = await Promise.all([
    admin
      .from("students")
      .select(
        "id, full_name, email, phone, joined_at, approved_at, current_surah, current_ayah, current_page, start_surah, start_ayah, daily_new_ayahs, review_direction, is_active"
      )
      .eq("id", id)
      .single(),
    admin.from("surahs").select("number, name"),
    admin.rpc("get_next_tasmee_assignment", { p_student_id: id }),
    admin
      .from("daily_review_schedule")
      .select("from_surah, from_ayah, to_surah, to_ayah")
      .eq("student_id", id)
      .eq("schedule_date", today)
      .maybeSingle(),
    admin
      .from("latest_report_status")
      .select("status, from_surah, from_ayah, to_surah, to_ayah, itqan_score, session_date, session_type, halaqa_number")
      .eq("student_id", id)
      .maybeSingle(),
    admin
      .from("weekly_review_readiness")
      .select("days_reviewed, days_missed, days_not_recorded")
      .eq("student_id", id)
      .maybeSingle(),
    admin
      .from("reports")
      .select("status, from_surah, from_ayah, to_surah, to_ayah, itqan_score, recorded_at, sessions(session_date, halaqa_number, session_type)")
      .eq("student_id", id)
      .order("recorded_at", { ascending: false })
      .limit(8),
  ]);

  if (!student) redirect("/teacher");

  const surahName = (n: number | null) => surahs?.find((s) => s.number === n)?.name ?? "";
  const tasmee = tasmeeRows?.[0] as
    | { from_surah: number; from_ayah: number; to_surah: number; to_ayah: number }
    | undefined;

  return (
    <main className="flex min-h-screen flex-col gap-4 p-5" style={{ background: "var(--color-gray-bg)" }}>
      <header className="no-print flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/teacher" style={{ color: "var(--color-gray)" }}>
            <Icon.ChevronLeft size={20} />
          </Link>
          <h1 className="text-lg font-bold" style={{ color: "var(--color-text)" }}>
            {student.full_name}
          </h1>
        </div>
        <PrintButton />
      </header>

      <h1 className="hidden text-lg font-bold print:block" style={{ color: "var(--color-text)" }}>
        تقرير الطالب: {student.full_name}
      </h1>

      <section
        className="rounded-2xl bg-white p-4 shadow-sm border flex flex-col gap-2"
        style={{ borderColor: "var(--color-border)" }}
      >
        <p className="text-sm" style={{ color: "var(--color-subtext)" }} dir="ltr">
          {student.email}
        </p>
        {student.phone && (
          <p className="text-sm" style={{ color: "var(--color-subtext)" }} dir="ltr">
            {student.phone}
          </p>
        )}
        <div className="mt-2 grid grid-cols-2 gap-3 text-sm">
          <div>
            <p style={{ color: "var(--color-gray)" }}>نقطة الحفظ الحالية</p>
            <p className="font-bold" style={{ color: "var(--color-text)" }}>
              {surahName(student.current_surah)} : {student.current_ayah}
            </p>
          </div>
          <div>
            <p style={{ color: "var(--color-gray)" }}>نقطة البداية</p>
            <p className="font-bold" style={{ color: "var(--color-text)" }}>
              {surahName(student.start_surah)} : {student.start_ayah}
            </p>
          </div>
          <div>
            <p style={{ color: "var(--color-gray)" }}>عدد الآيات اليومي المتوقع</p>
            <p className="font-bold" style={{ color: "var(--color-text)" }}>{student.daily_new_ayahs}</p>
          </div>
          <div>
            <p style={{ color: "var(--color-gray)" }}>اتجاه الحفظ والمراجعة</p>
            <p className="font-bold" style={{ color: "var(--color-text)" }}>
              {student.review_direction === "forward" ? "إلى الأمام" : "إلى الخلف"}
            </p>
          </div>
        </div>
        <p className="mt-1 text-xs" style={{ color: "var(--color-gray)" }}>
          انضم: {formatKuwaitDateTime(student.joined_at)}
          {student.approved_at && ` · فُعّل: ${formatKuwaitDateTime(student.approved_at)}`}
        </p>
      </section>

      <section
        className="rounded-2xl bg-white p-4 shadow-sm border flex flex-col gap-1.5"
        style={{ borderColor: "var(--color-border)" }}
      >
        <h2 className="text-sm font-bold" style={{ color: "var(--color-text)" }}>
          مقرر التسميع القادم
        </h2>
        {tasmee ? (
          <p className="text-sm" style={{ color: "var(--color-text)" }}>
            من {surahName(tasmee.from_surah)} : {tasmee.from_ayah} — إلى {surahName(tasmee.to_surah)} : {tasmee.to_ayah}
          </p>
        ) : (
          <p className="text-sm" style={{ color: "var(--color-subtext)" }}>لا توجد نقطة حفظ محددة بعد.</p>
        )}
      </section>

      <section
        className="rounded-2xl bg-white p-4 shadow-sm border flex flex-col gap-1.5"
        style={{ borderColor: "var(--color-border)" }}
      >
        <h2 className="text-sm font-bold" style={{ color: "var(--color-text)" }}>
          مقرر المراجعة لليوم
        </h2>
        {todayReview ? (
          <p className="text-sm" style={{ color: "var(--color-text)" }}>
            من {surahName(todayReview.from_surah)} : {todayReview.from_ayah} — إلى {surahName(todayReview.to_surah)} : {todayReview.to_ayah}
          </p>
        ) : (
          <p className="text-sm" style={{ color: "var(--color-subtext)" }}>لا يوجد مقرر مراجعة مُحدّد لهذا اليوم.</p>
        )}
        <Link
          href={`/teacher/students/${id}/weekly-assignment`}
          className="no-print mt-1 text-sm font-medium"
          style={{ color: "var(--color-green)" }}
        >
          تعديل مقرر المراجعة الأسبوعي ←
        </Link>
      </section>

      <section
        className="rounded-2xl bg-white p-4 shadow-sm border flex flex-col gap-1.5"
        style={{ borderColor: "var(--color-border)" }}
      >
        <h2 className="text-sm font-bold" style={{ color: "var(--color-text)" }}>
          آخر تقرير حصة
        </h2>
        {latestReport ? (
          <div className="flex items-center justify-between">
            <p className="text-sm" style={{ color: "var(--color-text)" }}>
              حلقة {latestReport.halaqa_number} — من {surahName(latestReport.from_surah)} : {latestReport.from_ayah} إلى{" "}
              {surahName(latestReport.to_surah)} : {latestReport.to_ayah}
              {latestReport.itqan_score != null && ` · إتقان ${latestReport.itqan_score}`}
            </p>
            <span
              className="rounded-full px-2.5 py-1 text-xs font-semibold shrink-0"
              style={STATUS_COLOR[latestReport.status as ReportStatus]}
            >
              {STATUS_LABEL[latestReport.status as ReportStatus]}
            </span>
          </div>
        ) : (
          <p className="text-sm" style={{ color: "var(--color-subtext)" }}>لا توجد تقارير حصص بعد.</p>
        )}
      </section>

      <section
        className="rounded-2xl bg-white p-4 shadow-sm border flex flex-col gap-1.5"
        style={{ borderColor: "var(--color-border)" }}
      >
        <h2 className="text-sm font-bold" style={{ color: "var(--color-text)" }}>
          التزام المراجعة الذاتية (آخر 6 أيام)
        </h2>
        {readiness ? (
          <div className="flex gap-4 text-sm">
            <p style={{ color: "var(--color-green)" }}>✓ {readiness.days_reviewed} مراجَع</p>
            <p style={{ color: "var(--color-red)" }}>✗ {readiness.days_missed} متروك</p>
            <p style={{ color: "var(--color-gray)" }}>○ {readiness.days_not_recorded} غير مسجّل</p>
          </div>
        ) : (
          <p className="text-sm" style={{ color: "var(--color-subtext)" }}>لا توجد بيانات.</p>
        )}
      </section>

      <section
        className="rounded-2xl bg-white p-4 shadow-sm border flex flex-col gap-2"
        style={{ borderColor: "var(--color-border)" }}
      >
        <h2 className="text-sm font-bold" style={{ color: "var(--color-text)" }}>
          سجل آخر الحصص
        </h2>
        {recentReports?.length ? (
          <div className="flex flex-col divide-y" style={{ borderColor: "var(--color-border)" }}>
            {recentReports.map((r, i) => {
              const session = r.sessions as unknown as
                | { session_date: string; halaqa_number: number; session_type: string }
                | null;
              return (
                <div key={i} className="flex items-center justify-between py-2.5">
                  <div>
                    <p className="text-sm" style={{ color: "var(--color-text)" }}>
                      حلقة {session?.halaqa_number} — {session?.session_date}
                    </p>
                    <p className="text-xs" style={{ color: "var(--color-subtext)" }}>
                      من {surahName(r.from_surah)} : {r.from_ayah} إلى {surahName(r.to_surah)} : {r.to_ayah}
                    </p>
                  </div>
                  <span
                    className="rounded-full px-2.5 py-1 text-xs font-semibold shrink-0"
                    style={STATUS_COLOR[r.status as ReportStatus]}
                  >
                    {STATUS_LABEL[r.status as ReportStatus]}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm" style={{ color: "var(--color-subtext)" }}>لا توجد حصص مسجّلة بعد.</p>
        )}
      </section>
    </main>
  );
}
