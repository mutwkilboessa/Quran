import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// عميل بصلاحيات service_role - يُستخدم فقط داخل Server Actions الخاصة بالمعلم
// (تفعيل طالب، تعديل مقرر أسبوعي...) ولا يُستورد إطلاقاً في كود يعمل بالمتصفح
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "متغيرات بيئة Supabase (NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY) غير مضبوطة في هذا النشر."
    );
  }

  return createSupabaseClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
