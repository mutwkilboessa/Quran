"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireTeacher } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function approveStudent(
  studentId: string,
  startSurah: number,
  startAyah: number,
  dailyNewAyahs: number,
  direction: "forward" | "backward"
) {
  await requireTeacher();
  const admin = createAdminClient();

  const { error: rpcError } = await admin.rpc("approve_student", {
    p_student_id: studentId,
    p_start_surah: startSurah,
    p_start_ayah: startAyah,
    p_daily_new_ayahs: dailyNewAyahs,
  });
  if (rpcError) return { error: rpcError.message };

  const { error: updateError } = await admin
    .from("students")
    .update({ review_direction: direction })
    .eq("id", studentId);
  if (updateError) return { error: updateError.message };

  revalidatePath("/teacher/pending");
  revalidatePath("/teacher");
  redirect("/teacher/pending");
}

export async function rejectStudent(studentId: string) {
  await requireTeacher();
  const admin = createAdminClient();
  await admin.from("students").update({ approval_status: "rejected" }).eq("id", studentId);
  revalidatePath("/teacher/pending");
  revalidatePath("/teacher");
  redirect("/teacher/pending");
}
