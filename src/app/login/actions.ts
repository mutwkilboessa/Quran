"use server";

import { createClient } from "@/lib/supabase/server";

type ActionResult = { error: string } | { ok: true };

// يرسل رابط دخول سحري إلى البريد الإلكتروني المُدخل، وينشئ المستخدم تلقائياً إن لم يكن موجوداً
export async function requestLoginCode(formData: FormData): Promise<ActionResult> {
  const fullName = (formData.get("fullName") as string)?.trim();
  const email = (formData.get("email") as string)?.trim().toLowerCase();

  if (!fullName || !email) {
    return { error: "الرجاء إدخال الاسم والبريد الإلكتروني" };
  }

  // رابط ثابت دائماً، بدل الاعتماد على الدومين الذي فُتحت منه الصفحة (قد يكون دومين قديم معطّل محفوظ كإشارة مرجعية)
  const origin = process.env.NEXT_PUBLIC_SITE_URL;
  if (!origin) {
    return { error: "خطأ في إعدادات الموقع، تواصل مع المعلم" };
  }

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
