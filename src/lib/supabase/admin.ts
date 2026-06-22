import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// عميل بصلاحيات service_role - يُستخدم فقط داخل Server Actions الخاصة بالمعلم
// (تفعيل طالب، تعديل مقرر أسبوعي...) ولا يُستورد إطلاقاً في كود يعمل بالمتصفح
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
