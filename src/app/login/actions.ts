"use server";

import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";

type ActionResult = { error: string } | { ok: true };

// يرسل رابط دخول سحري إلى البريد الإلكتروني المُدخل، وينشئ المستخدم تلقائياً إن لم يكن موجوداً
export async function requestLoginCode(formData: FormData): Promise<ActionResult> {
  const fullName = (formData.get("fullName") as string)?.trim();
  const email = (formData.get("email") as string)?.trim().toLowerCase();

  if (!fullName || !email) {
    return { error: "الرجاء إدخال الاسم والبريد الإلكتروني" };
  }

  const requestHeaders = await headers();
  const origin = requestHeaders.get("origin") ?? `https://${requestHeaders.get("host")}`;

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: true,
      data: { full_name: fullName },
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    return { error: "تعذّر إرسال رابط الدخول، تحقق من البريد الإلكتروني وحاول مرة أخرى" };
  }

  return { ok: true };
}
