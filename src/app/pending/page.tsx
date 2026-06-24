import { redirect } from "next/navigation";
import { getSessionRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/lib/actions/sign-out";
import { Icon } from "@/components/icons";

export default async function PendingPage() {
  const role = await getSessionRole();

  if (role.kind === "anonymous") redirect("/login");
  if (role.kind === "teacher") redirect("/teacher");
  if (role.kind === "approved") redirect("/student");

  const supabase = await createClient();
  const { data: settings } = await supabase
    .from("halaqa_settings")
    .select("whatsapp_group_link, halaqa_name")
    .eq("id", 1)
    .single();

  const isRejected = role.kind === "rejected";

  return (
    <main
      className="flex min-h-screen flex-col items-center justify-center px-6"
      style={{ background: "var(--color-gray-bg)" }}
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-sm border text-center"
        style={{ borderColor: "var(--color-border)" }}
      >
        <div
          className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full"
          style={{
            background: isRejected ? "var(--color-red-bg)" : "var(--color-green-bg)",
            color: isRejected ? "var(--color-red)" : "var(--color-green)",
          }}
        >
          <Icon.User size={26} />
        </div>

        <h1 className="mb-1 text-lg font-bold" style={{ color: "var(--color-text)" }}>
          {role.fullName}
        </h1>

        {isRejected ? (
          <p className="text-sm" style={{ color: "var(--color-subtext)" }}>
            للأسف لم تتم الموافقة على طلب التسجيل، تواصل مع المعلم لمزيد من التفاصيل.
          </p>
        ) : (
          <>
            <p className="mb-5 text-sm" style={{ color: "var(--color-subtext)" }}>
              تم استلام تسجيلك بنجاح، وهو الآن قيد المراجعة من المعلم. بإمكانك الانضمام لمجموعة
              واتساب الحلقة بالعّضط أدناه.
            </p>
            {settings?.whatsapp_group_link && (
              <a
                href={settings.whatsapp_group_link}
                target="_blank"
                rel="noopener noreferrer"
                className="mb-3 flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold text-white"
                style={{ background: "var(--color-green)" }}
              >
                <Icon.Link size={16} />
                الانضمام إلى مجموعة واتساب الحلقة
              </a>
            )}
          </>
        )}

        <form action={signOut}>
          <button
            type="submit"
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg border py-2.5 text-sm font-medium"
            style={{ borderColor: "var(--color-border)", color: "var(--color-gray)" }}
          >
            تسجيل الخروج
          </button>
        </form>
      </div>
    </main>
  );
}
