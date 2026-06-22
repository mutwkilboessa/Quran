"use client";

import { useRef, useState, useTransition, type FormEvent } from "react";
import { importSessionData } from "./actions";

export default function ImportForm({
  defaultSessionDate,
  defaultHalaqaNumber,
}: {
  defaultSessionDate: string;
  defaultHalaqaNumber: number;
}) {
  const [sessionDate, setSessionDate] = useState(defaultSessionDate);
  const [sessionType, setSessionType] = useState("tasmee");
  const [halaqaNumber, setHalaqaNumber] = useState(defaultHalaqaNumber);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      setError("يرجى اختيار ملف Excel المعبّأ");
      return;
    }
    const formData = new FormData();
    formData.set("file", file);
    formData.set("sessionDate", sessionDate);
    formData.set("sessionType", sessionType);
    formData.set("halaqaNumber", String(halaqaNumber));

    startTransition(async () => {
      const result = await importSessionData(formData);
      if (result && "error" in result) setError(result.error ?? "حدث خطأ عير متوقع");
      else if (result && "success" in result) {
        setSuccess(`تم استيراد بيانات ${result.processed ?? 0} طالب بنجاح`);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium" style={{ color: "var(--color-text)" }}>
            تاريخ الحصة
          </label>
          <input
            required
            type="date"
            value={sessionDate}
            onChange={(e) => setSessionDate(e.target.value)}
            className="rounded-lg border px-3 py-2.5 text-sm outline-none"
            style={{ borderColor: "var(--color-border)" }}
            dir="ltr"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium" style={{ color: "var(--color-text)" }}>
            رقم الحلقة
          </label>
          <input
            required
            type="number"
            min={1}
            value={halaqaNumber}
            onChange={(e) => setHalaqaNumber(Number(e.target.value))}
            className="rounded-lg border px-3 py-2.5 text-sm outline-none"
            style={{ borderColor: "var(--color-border)" }}
            dir="ltr"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium" style={{ color: "var(--color-text)" }}>
          نوع الحصة
        </label>
        <select
          value={sessionType}
          onChange={(e) => setSessionType(e.target.value)}
          className="rounded-lg border px-3 py-2.5 text-sm outline-none"
          style={{ borderColor: "var(--color-border)" }}
        >
          <option value="tasmee">تسميع</option>
          <option value="review">مراجعة شاملة</option>
          <option value="monthly_sard">سرد شهري</option>
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium" style={{ color: "var(--color-text)" }}>
          ملف Excel المعبّأ
        </label>
        <input
          ref={fileInputRef}
          required
          type="file"
          accept=".xlsx,.xls"
          className="rounded-lg border px-3 py-2.5 text-sm outline-none"
          style={{ borderColor: "var(--color-border)" }}
        />
      </div>

      {error && (
        <p className="text-sm" style={{ color: "var(--color-red)" }}>
          {error}
        </p>
      )}
      {success && (
        <p className="text-sm" style={{ color: "var(--color-green)" }}>
          {success}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="rounded-lg py-2.5 text-sm font-semibold text-white disabled:opacity-60"
        style={{ background: "var(--color-green)" }}
      >
        {isPending ? "جارٍ الاستيراد..." : "استيراد البيانات"}
      </button>
    </form>
  );
}
