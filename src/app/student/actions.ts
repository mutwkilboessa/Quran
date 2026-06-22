"use server";

import { revalidatePath } from "next/cache";
import { requireApprovedStudent } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { getKuwaitDateString, getKuwaitDayIndex } from "@/lib/date";

export async function submitSelfReview(reviewed: boolean) {
  const role = await requireApprovedStudent();

  if (getKuwaitDayIndex() === 6) {
    return { error: "لا يُسجَّل مراجعة ذاتية يوم السبت - هذا يوم المراجعة الشاملة بالحلقة" };
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("daily_self_review")
    .upsert(
      { student_id: role.studentId, review_date: getKuwaitDateString(), reviewed },
      { onConflict: "student_id,review_date" }
    );
  if (error) return { error: error.message };

  revalidatePath("/student");
}
