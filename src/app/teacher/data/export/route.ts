import { NextRequest } from "next/server";
import * as XLSX from "xlsx";
import { requireTeacher } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { STATUS_LABEL } from "@/lib/reportStatus";

export async function GET(request: NextRequest) {
  await requireTeacher();
  const admin = createAdminClient();

  const { data: students } = await admin
    .from("students")
    .select("id, full_name, current_surah, current_ayah")
    .eq("approval_status", "approved")
    .eq("is_active", true)
    .order("full_name");

  const sessionDate = request.nextUrl.searchParams.get("date") ?? "";
  const sessionType = request.nextUrl.searchParams.get("type") ?? "tasmee";
  const halaqaNumber = request.nextUrl.searchParams.get("number") ?? "";

  const header = [
    "معرف الطالب",
    "الاسم",
    "من سورة",
    "من آية",
    "إلى سورة",
    "إلى آية",
    "الحالة",
    "الإتقان",
    "حاضر",
    "ملاحظات",
  ];

  const rows = (students ?? []).map((s) => [
    s.id,
    s.full_name,
    s.current_surah ?? "",
    s.current_ayah ?? "",
    "",
    "",
    STATUS_LABEL.completed,
    "",
    "نعم",
    "",
  ]);

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet([header, ...rows]);
  ws["!cols"] = [
    { wch: 36 },
    { wch: 20 },
    { wch: 10 },
    { wch: 8 },
    { wch: 10 },
    { wch: 8 },
    { wch: 12 },
    { wch: 10 },
    { wch: 8 },
    { wch: 24 },
  ];
  XLSX.utils.book_append_sheet(wb, ws, "حصة");

  const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" }) as Buffer;

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="halaqa-${halaqaNumber || sessionDate || "session"}-${sessionType}.xlsx"`,
    },
  });
}
