"use server";

import * as XLSX from "xlsx";
import { revalidatePath } from "next/cache";
import { requireTeacher } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { LABEL_TO_STATUS } from "@/lib/reportStatus";

type SheetRow = {
  "معرف الطالب"?: string;
  "الاسم"?: string;
  "من سورة"?: number;
  "من آية"?: number;
  "إلى سورة"?: number;
  "إلى آية"?: number;
  "الحالة"?: string;
  "الإتقان"?: number;
  "حاضر"?: string;
  "ملاحظات"?: string;
};

export async function importSessionData(formData: FormData) {
  await requireTeacher();
  const admin = createAdminClient();

  const file = formData.get("file") as File | null;
  const sessionDate = String(formData.get("sessionDate") ?? "");
  const sessionType = String(formData.get("sessionType") ?? "tasmee");
  const halaqaNumber = Number(formData.get("halaqaNumber"));

  if (!file || !sessionDate || !halaqaNumber) {
    return { error: "يرجى تعبئة بيانات الحصة واختيار الملف" };
  }

  const buffer = await file.arrayBuffer();
  const wb = XLSX.read(buffer, { type: "array" });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<SheetRow>(ws);

  const { data: session, error: sessionError } = await admin
    .from("sessions")
    .upsert(
      { halaqa_number: halaqaNumber, session_date: sessionDate, session_type: sessionType },
      { onConflict: "halaqa_number" }
    )
    .select("id")
    .single();
  if (sessionError) return { error: sessionError.message };

  let processed = 0;
  for (const row of rows) {
    const studentId = row["معرف الطالب"];
    const fromSurah = Number(row["من سورة"]);
    const fromAyah = Number(row["من آية"]);
    const toSurah = Number(row["إلى سورة"]);
    const toAyah = Number(row["إلى آية"]);
    const status = LABEL_TO_STATUS[row["الحالة"] ?? ""] ?? "not_completed";
    const itqanScore = row["الإتقان"] ? Number(row["الإتقان"]) : null;
    const present = row["حاضر"] === "نعم";
    const notes = row["ملاحظات"] || null;

    if (!studentId || !fromSurah || !fromAyah || !toSurah || !toAyah) continue;

    const [{ data: fromPage }, { data: toPage }] = await Promise.all([
      admin.rpc("ayah_to_page", { p_surah: fromSurah, p_ayah: fromAyah }),
      admin.rpc("ayah_to_page", { p_surah: toSurah, p_ayah: toAyah }),
    ]);

    await admin.from("reports").upsert(
      {
        session_id: session.id,
        student_id: studentId,
        from_surah: fromSurah,
        from_ayah: fromAyah,
        to_surah: toSurah,
        to_ayah: toAyah,
        from_page: fromPage,
        to_page: toPage,
        status,
        itqan_score: itqanScore,
        teacher_notes: notes,
      },
      { onConflict: "session_id,student_id" }
    );

    await admin.from("attendance").upsert(
      {
        session_id: session.id,
        student_id: studentId,
        present,
        excuse_reason: present ? null : notes,
      },
      { onConflict: "session_id,student_id" }
    );

    if (status === "completed") {
      await admin
        .from("students")
        .update({ current_surah: toSurah, current_ayah: toAyah, current_page: toPage })
        .eq("id", studentId);
    }

    processed += 1;
  }

  revalidatePath("/teacher");
  revalidatePath("/teacher/data");

  return { success: true, processed };
}
