"use server";

import { createClient } from "@/lib/supabase/server";

type ActionResult = { error: string } | { ok: true };

export async function requestLoginCode(formData: FormData): Promise<ActionResult> {
  const fullName = (formData.get("fullName") as string)?.trim();
  const email = (formData.get("email") as string)?.trim().toLowerCase();

  if (!fullName || !email) {
    return { error: "الرجاء إدخال الاسم والبريد الإلكتروني" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: true,
      data: { full_name: fullName },
    },
  });

  if (error) {
    console.error("OTP error:", error.message);
    return { error: "تعذّر إرسال الرمز، تحقق من البريد وحاول مرة أخرى" };
  }

  return { ok: true };
}

export async function verifyLoginCode(formData: FormData): Promise<ActionResult> {
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const token = (formData.get("token") as string)?.trim();

  if (!email || !token) {
    return { error: "الرجاء إدخال الرمز" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: "email",
  });

  if (error) {
    return { error: "الرمز عير صحيح أو انتهت صلاحيته" };
  }

  return { ok: true };
}
