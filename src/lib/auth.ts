import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export type SessionRole =
  | { kind: "anonymous" }
  | { kind: "teacher"; email: string }
  | { kind: "pending"; studentId: string; fullName: string }
  | { kind: "approved"; studentId: string; fullName: string }
  | { kind: "rejected"; studentId: string; fullName: string };

// يحدد دور المستخدم الحالي (معلم / طالب معلّق / طالب مفعّل / طالب مرفوض) بناءً على الجلسة الحالية
export async function getSessionRole(): Promise<SessionRole> {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;

  if (!user || !user.email) return { kind: "anonymous" };

  const teacherEmail = process.env.TEACHER_EMAIL?.trim().toLowerCase();
  if (teacherEmail && user.email.toLowerCase() === teacherEmail) {
    return { kind: "teacher", email: user.email };
  }

  const admin = createAdminClient();
  const { data: student } = await admin
    .from("students")
    .select("id, full_name, approval_status")
    .eq("id", user.id)
    .maybeSingle();

  if (!student) {
    return {
      kind: "pending",
      studentId: user.id,
      fullName: (user.user_metadata?.full_name as string) ?? "",
    };
  }

  if (student.approval_status === "approved") {
    return { kind: "approved", studentId: student.id, fullName: student.full_name };
  }
  if (student.approval_status === "rejected") {
    return { kind: "rejected", studentId: student.id, fullName: student.full_name };
  }
  return { kind: "pending", studentId: student.id, fullName: student.full_name };
}

// يُستدعى من بدايات Server Actions الخاصة بالمعلم لمنع أي استدعاء الت مخوّل
export async function requireTeacher() {
  const role = await getSessionRole();
  if (role.kind !== "teacher") throw new Error("عير مخوّل - هذه العملية للمعلم فقط");
  return role;
}

// يُستدعى من بدايات Server Actions الخاصة بالطالب المفعّل (مثل تسجيل المراجعة الذاتية)
export async function requireApprovedStudent() {
  const role = await getSessionRole();
  if (role.kind !== "approved") throw new Error("عير مخوّل");
  return role;
}
