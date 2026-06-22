import { redirect } from "next/navigation";
import { getSessionRole } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { signOut } from "@/lib/actions/sign-out";
import { formatKuwaitNow, getKuwaitDateString, getKuwaitDayIndex, getDayType } from "@/lib/date";
import { STATUS_LABEL, STATUS_COLOR, type ReportStatus } from "@/lib/reportStatus";
import { Icon } from "@/components/icons";
import SelfReviewCard from "./SelfReviewCard";

const DAY_TYPE_LABEL: Record<string, string> = {
  tasmee: "يوم تسميع",
  hifz: "يوم حفظ منزلي",
  review: "يوم مراجعة شاملة",
  off: "لا يوجد التزام اليوم",
};

export default async function StudentHomePage() {
  const role = await getSessionRole();
  if (role.kind !== "approved") redirect("/login");

  const admin = createAdminClient();
  const today = getKuwaitDateString();
  const dayIndex = getKuwaitDayIndex();

  const [
    { data: settings },
    { data: student },
    { data: surahs },
    { data: tasmeeRows },
    { data: todayReview },
    { data: selfReview },
    { data: latestReport },
    { data: progress },
  ] = await Promise.all([
    admin
      .from("halaqa_settings")
      .select(
        "halaqa_name, meeting_link, whatsapp_group_link, live_status, tasmee_days, review_days, hifz_homework_days, tasmee_start_time, tasmee_end_time, review_start_time, review_end_time"
      )
      .eq("id", 1)
      .single(),
    admin
      .from("students")
      .select("current_surah, current_ayah, daily_new_ayahs")
      .eq("id", role.studentId)
      .single(),
    admin.from("surahs").select("number, name"),
    admin.rpc("get_next_tasmee_assignment", { p_student_id: role.studentId }),
    admin
      .from("daily_review_schedule")
      .select("from_surah, from_ayah, to_surah, to_ayah")
      .eq("student_id", role.studentId)
      .eq("schedule_date", today)
      .maybeSingle(),
    admin
      .from("daily_self_review")
      .select("reviewed")
      .eq("student_id", role.studentId)
      .eq("review_date", today)
      .maybeSingle(),
    admin
      .from("latest_report_status")
      .select("status, from_surah, from_ayah, to_surah, to_ayah, session_date, halaqa_number")
      .eq("student_id", role.studentId)
      .maybeSingle(),
    admin
      .from("student_progress")
      .select("percent_of_quran")
      .eq("id", role.studentId)
      .maybeSingle(),
  ]);

  const surahName = (n: number | null | undefined) => surahs?.find((s) => s.number === n)?.name ?? "";
  const tasmee = tasmeeRows?.[0] as
    | { from_surah: number; from_ayah: number; to_surah: number; to_ayah: number }
    | undefined;

  const dayType = settings
    ? getDayType(dayIndex, {
        tasmee_days: settings.tasmee_days ?? [],
        review_days: settings.review_days ?? [],
        hifz_homework_days: settings.hifz_homework_days ?? [],
      })
    : "off";

  const isLive = settings?.live_status === "live";

  return (
    <main className="flex min-h-screen flex-col gap-4 p-5" style={{ background: "var(--color-gray-bg)" }}>
      <header>
        <h1 className="text-lg font-bold" style={{ color: "var(--color-text)" }}>
          أهلاً {role.fullName}
        </h1>
        <p className="text-sm" style={{ color: "var(--color-subtext)" }}>
          {formatKuwaitNow()}
        </p>
      </header>

      <section
        className="rounded-2xl p-4 shadow-sm flex items-center justify-between"
        style={
          isLive
            ? { background: "var(--color-green-bg)" }
            : { background: "white", border: "1px solid var(--color-border)" }
        }
      >
        <span className="flex items-center gap-2 text-sm font-bold" style={{ color: isLive ? "var(--color-green)" : "var(--color-gray)" }}>
          {isLive ? <Icon.Play size={18} /> : <Icon.Calendar size={18} />}
          {isLive ? "الحلقة مباشرة الآن" : "الحلقة لم تبدأ بعد"}
        </span>
        {isLive && settings?.meeting_link && (
          <a
            href={settings.meeting_link}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg px-3 py-2 text-xs font-semibold text-white"
            style={{ background: "var(--color-green)" }}
          >
            دخول الاجتماع
          </a>
        )}
      </section>

      <section
        className="rounded-2xl bg-white p-4 shadow-sm border flex flex-col gap-2"
        style={{ borderColor: "var(--color-border)" }}
      >
        <h2 className="text-sm font-bold" style={{ color: "var(--color-text)" }}>
          نقطة الحفظ الحالية
        </h2>
        <p className="text-sm" style={{ color: "var(--color-text)" }}>
          {surahName(student?.current_surah)} : {student?.current_ayah}
        </p>
        {progress?.percent_of_quran != null && (
          <p className="text-xs" style={{ color: "var(--color-subtext)" }}>
            أنجزت {progress.percent_of_quran}% من القران الكريم
          </p>
        )}
      </section>

      <section
        className="rounded-2xl bg-white p-4 shadow-sm border flex flex-col gap-1.5"
        style={{ borderColor: "var(--color-border)" }}
      >
        <h2 className="text-sm font-bold" style={{ color: "var(--color-text)" }}>
          مهمة اليوم — {DAY_TYPE_LABEL[dayType]}
        </h2>
        {dayType === "tasmee" && tasmee && (
          <p className="text-sm" style={{ color: "var(--color-text)" }}>
            مقرر التسميع: من {surahName(tasmee.from_surah)} : {tasmee.from_ayah} — إلى {surahName(tasmee.to_surah)} :{" "}
            {tasmee.to_ayah}
          </p>
        )}
        {dayType === "hifz" && (
          <p className="text-sm" style={{ color: "var(--color-text)" }}>
            استمر بحفظ مقررك الجديد استعداداً لحصة التسميع القادمة.
          </p>
        )}
        {dayType === "review" && (
          <p className="text-sm" style={{ color: "var(--color-text)" }}>
            اليوم مراجعة شاملة بالحلقة — راجع كل ما حفظته هذا الأسبوع.
          </p>
        )}
      </section>

      {todayReview && (
        <section
          className="rounded-2xl bg-white p-4 shadow-sm border flex flex-col gap-1.5"
          style={{ borderColor: "var(--color-border)" }}
        >
          <h2 className="text-sm font-bold" style={{ color: "var(--color-text)" }}>
            مقرر المراجعة التراكمية لليوم
          </h2>
          <p className="text-sm" style={{ color: "var(--color-text)" }}>
            من {surahName(todayReview.from_surah)} : {todayReview.from_ayah} — إلى {surahName(todayReview.to_surah)} :{" "}
            {todayReview.to_ayah}
          </p>
        </section>
      )}

      <SelfReviewCard initialValue={selfReview?.reviewed ?? null} isSaturday={dayIndex === 6} />

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

      {settings?.whatsapp_group_link && (
        <a
          href={settings.whatsapp_group_link}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 rounded-lg border py-2.5 text-sm font-medium"
          style={{ borderColor: "var(--color-border)", color: "var(--color-text)" }}
        >
          <Icon.Link size={16} />
          مجموعة واتساب الحلقة
        </a>
      )}

      <form action={signOut}>
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
