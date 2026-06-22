"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireTeacher } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function setWeeklyAssignment(
  studentId: string,
  weekStart: string,
  fromPage: number,
  toPage: number,
  direction: "forward" | "backward"
) {
  await requireTeacher();
  const admin = createAdminClient();

  const { data, error: upsertError } = await admin
    .from("weekly_review_assignment")
    .upsert(
      { student_id: studentId, week_start: weekStart, from_page: fromPage, to_page: toPage, direction },
      { onConflict: "student_id,week_start" }
    )
    .select("id")
    .single();
  if (upsertError) return { error: upsertError.message };

  const { error: rpcError } = await admin.rpc("generate_daily_review_schedule", {
    p_weekly_assignment_id: data.id,
  });
  if (rpcError) return { error: rpcError.message };

  revalidatePath(`/teacher/students/${studentId}`);
  revalidatePath("/teacher/readiness");
  redirect(`/teacher/students/${studentId}`);
}
