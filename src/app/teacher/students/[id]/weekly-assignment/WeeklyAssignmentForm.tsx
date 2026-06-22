"use client";

import { useMemo, useState, useTransition, type FormEvent } from "react";
import { setWeeklyAssignment } from "./actions";
import { distributePages } from "@/lib/quran";

const WEEKDAY_LABELS = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة"];

export default function WeeklyAssignmentForm({
  studentId,
  defaultWeekStart,
  defaultFromPage,
  defaultToPage,
  defaultDirection,
}: {
  studentId: string;
  defaultWeekStart: string;
  defaultFromPage: number;
  defaultToPage: number;
  defaultDirection: "forward" | "backward";
}) {
  const [weekStart, setWeekStart] = useState(defaultWeekStart);
  const [fromPage, setFromPage] = useState(defaultFromPage);
  const [toPage, setToPage] = useState(defaultToPage);
  const [direction, setDirection] = useState<"forward" | "backward">(defaultDirection);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const preview = useMemo(() => {
    if (!fromPage || !toPage) return [];
    return distributePages(fromPage, toPage, direction);
  }, [fromPage, toPage, direction]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await setWeeklyAssignment(studentId, weekStart, fromPage, toPage, direction);
      if (result && "error" in result) setError(result.error);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium" style={{ color: "var(--color-text)" }}>
          بداية الأسبوع
        </label>
        <input
          required
          type="date"
          value={weekStart}
          onChange={(e) => setWeekStart(e.target.value)}
          className="rounded-lg border px-3 py-2.5 text-sm outline-none"
          style={{ borderColor: "var(--color-border)" }}
          dir="ltr"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium" style={{ color: "var(--color-text)" }}>
            من صفحة
          </label>
          <input
            required
            type="number"
            min={1}
            max={604}
            value={fromPage}
            onChange={(e) => setFromPage(Number(e.target.value))}
            className="rounded-lg border px-3 py-2.5 text-sm outline-none"
            style={{ borderColor: "var(--color-border)" }}
            dir="ltr"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium" style={{ color: "var(--color-text)" }}>
            إلى صفحة
          </label>
          <input
            required
            type="number"
            min={1}
            max={604}
            value={toPage}
            onChange={(e) => setToPage(Number(e.target.value))}
            className="rounded-lg border px-3 py-2.5 text-sm outline-none"
            style={{ borderColor: "var(--color-border)" }}
            dir="ltr"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium" style={{ color: "var(--color-text)" }}>
          اتجاه المراجعة
        </label>
        <select
          value={direction}
          onChange={(e) => setDirection(e.target.value as "forward" | "backward")}
          className="rounded-lg border px-3 py-2.5 text-sm outline-none"
          style={{ borderColor: "var(--color-border)" }}
        >
          <option value="forward">إلى الأمام</option>
          <option value="backward">إلى الخلف</option>
        </select>
      </div>

      {preview.length > 0 && (
        <div className="rounded-lg border p-3" style={{ borderColor: "var(--color-border)" }}>
          <p className="mb-2 text-sm font-bold" style={{ color: "var(--color-text)" }}>
            معاينة التوزيع اليومي
          </p>
          <div className="flex flex-col gap-1">
            {preview.map((day) => (
              <div key={day.dayOffset} className="flex items-center justify-between text-sm">
                <span style={{ color: "var(--color-subtext)" }}>{WEEKDAY_LABELS[day.dayOffset]}</span>
                <span style={{ color: "var(--color-text)" }} dir="ltr">
                  ص {day.fromPage} - {day.toPage}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

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
        {isPending ? "جارٍ الحفظ..." : "حفظ مقرر الأسبوع"}
      </button>
    </form>
  );
}
