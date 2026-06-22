"use client";

import { useState, useTransition, type FormEvent } from "react";
import { approveStudent, rejectStudent } from "./actions";

type Surah = { number: number; name: string };

export default function ApproveForm({ studentId, surahs }: { studentId: string; surahs: Surah[] }) {
  const [startSurah, setStartSurah] = useState(1);
  const [startAyah, setStartAyah] = useState(1);
  const [dailyNewAyahs, setDailyNewAyahs] = useState(10);
  const [direction, setDirection] = useState<"forward" | "backward">("forward");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleApprove(e: FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await approveStudent(studentId, startSurah, startAyah, dailyNewAyahs, direction);
      if (result && "error" in result) setError(result.error);
    });
  }

  function handleReject() {
    if (!confirm("هل تريد رفض هذا الطالب؟")) return;
    startTransition(() => rejectStudent(studentId));
  }

  return (
    <form onSubmit={handleApprove} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium" style={{ color: "var(--color-text)" }}>
          سورة نقطة البداية
        </label>
        <select
          value={startSurah}
          onChange={(e) => setStartSurah(Number(e.target.value))}
          className="rounded-lg border px-3 py-2.5 text-sm outline-none"
          style={{ borderColor: "var(--color-border)" }}
        >
          {surahs.map((s) => (
            <option key={s.number} value={s.number}>
              {s.number}. {s.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium" style={{ color: "var(--color-text)" }}>
          رقم الآية
        </label>
        <input
          required
          type="number"
          min={1}
          value={startAyah}
          onChange={(e) => setStartAyah(Number(e.target.value))}
          className="rounded-lg border px-3 py-2.5 text-sm outline-none"
          style={{ borderColor: "var(--color-border)" }}
          dir="ltr"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium" style={{ color: "var(--color-text)" }}>
          عدد الآيات اليومي المتوقع
        </label>
        <input
          required
          type="number"
          min={1}
          value={dailyNewAyahs}
          onChange={(e) => setDailyNewAyahs(Number(e.target.value))}
          className="rounded-lg border px-3 py-2.5 text-sm outline-none"
          style={{ borderColor: "var(--color-border)" }}
          dir="ltr"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium" style={{ color: "var(--color-text)" }}>
          اتجاه الحفظ والمراجعة
        </label>
        <select
          value={direction}
          onChange={(e) => setDirection(e.target.value as "forward" | "backward")}
          className="rounded-lg border px-3 py-2.5 text-sm outline-none"
          style={{ borderColor: "var(--color-border)" }}
        >
          <option value="forward">إلى الأمام (من الفاتحة نحو الناس)</option>
          <option value="backward">إلى الخلف (من الناس نحو الفاتحة)</option>
        </select>
      </div>

      {error && (
        <p className="text-sm" style={{ color: "var(--color-red)" }}>
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="rounded-lg py-2.5 text-sm font-semibold text-white disabled:opacity-60"
        style={{ background: "var(--color-green)" }}
      >
        {isPending ? "جارٍ التفعيل..." : "تفعيل الطالب"}
      </button>

      <button
        type="button"
        disabled={isPending}
        onClick={handleReject}
        className="rounded-lg border py-2.5 text-sm font-medium disabled:opacity-60"
        style={{ borderColor: "var(--color-red)", color: "var(--color-red)" }}
      >
        رفض الطالب
      </button>
    </form>
  );
}
