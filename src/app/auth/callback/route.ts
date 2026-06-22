import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// يستقبل رابط الدخول السحري من البريد الإلكتروني، يحوّله إلى جلسة، وينشئ سجل الطالب (إن لم يكن موجوداً) ثم يوجّهه للصفحة المناسبة
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const origin = request.nextUrl.origin;

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=رابط الدخول غير صالح`);
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.user) {
    return NextResponse.redirect(`${origin}/login?error=انتهت صلاحية رابط الدخول، حاول مرة أخرى`);
  }

  const teacherEmail = process.env.TEACHER_EMAIL?.trim().toLowerCase();
  if (teacherEmail && data.user.email?.toLowerCase() === teacherEmail) {
    return NextResponse.redirect(`${origin}/teacher`);
  }

  const admin = createAdminClient();
  const { data: existing } = await admin
    .from("students")
    .select("id, approval_status")
    .eq("id", data.user.id)
    .maybeSingle();

  if (!existing) {
    const fullName = (data.user.user_metadata?.full_name as string) ?? data.user.email ?? "";
    await admin.from("students").insert({
      id: data.user.id,
      full_name: fullName,
      email: data.user.email,
    });
    return NextResponse.redirect(`${origin}/pending`);
  }

  if (existing.approval_status === "approved") {
    return NextResponse.redirect(`${origin}/student`);
  }

  return NextResponse.redirect(`${origin}/pending`);
}
