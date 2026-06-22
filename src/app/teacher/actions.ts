"use server";

import { revalidatePath } from "next/cache";
import { requireTeacher } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function setLiveStatus(status: "not_started" | "live" | "ended") {
  await requireTeacher();
  const admin = createAdminClient();
  await admin.from("halaqa_settings").update({ live_status: status }).eq("id", 1);
  revalidatePath("/teacher");
  revalidatePath("/student");
}
