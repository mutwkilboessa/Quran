"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

type ActionResult = { error: string } | { ok: true };

// يرسل رمز تحقق (OTP) إلى البريد الإلكتروني المُدخل، وينشئ المستخدم تلقائياً إن لم يكن موجوداً
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
    return { error: "تعذّر إرسال رمز التحقق، تحقق من البريد الإلكتروني وحاول مرة أخرى" };
  }

  return { ok: true };
}

// يتحقق من الرمز المُدخل، وعنح النجاح ينشئ ستجل الطالب (إن لم يكن موجوداً) ويوجّهه للصفحة المناسبة
export async function verifyLoginCode(
  email: string,
  fullName: string,
  code: string
): Promise<ActionResult> {
  const normalizedEmail = email.trim().toLowerCase();

  const supabase = await createClient();
  const { data, error } = await supabase.auth.verifyOtp({
    email: normalizedEmail,
    token: code.trim(),
    type: "email",
  });

  if (error || !data.user) {
    return { error: "رمز التحقق غير صحيح، حاول مرة أخرى" };
  }

  const teacherEmail = process.env.TEACHER_EMAIL?.trim().toLowerCase();
  if (teacherEmail && data.user.email?.toLowerCase() === teacherEmail) {
    redirect("/teacher");
  }

  const admin = createAdminClient();
  const { data: existing } = await admin
    .from("students")
    .select("id, approval_status")
    .eq("id", data.user.id)
    .maybeSingle();

  if (!existing) {
    await admin.from("students").insert({
      id: data.user.id,
      full_name: fullName.trim() || (data.user.user_metadata?.full_name as string) || normalizedEmail,
      email: normalizedEmail,
    });
    redirect("/pending");
  }

  if (existing.approval_status === "approved") {
    redirect("/student");
  }

  redirect("/pending");
}
