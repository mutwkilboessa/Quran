"use client";

import { useState, useTransition } from "react";
import { submitSelfReview } from "./actions";
import { YesNoButtons } from "@/components/icons";

export default function SelfReviewCard({
  initialValue,
  isSaturday,
}: {
  initialValue: boolean | null;
  isSaturday: boolean;
}) {
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleChange(reviewed: boolean) {
    setError(null);
    startTransition(async () => {
      const result = await submitSelfReview(reviewed);
      if (result && "error" in result) setError(result.error);
      else setValue(reviewed);
    });
  }

  return (
    <section
      className="rounded-2xl bg-white p-4 shadow-sm border flex flex-col gap-2"
      style={{ borderColor: "var(--color-border)" }}
    >
      <h2 className="text-sm font-bold" style={{ color: "var(--color-text)" }}>
        هل راجعت محفوظك اليوم؟
      </h2>
      {isSaturday ? (
        <p className="text-sm" style={{ color: "var(--color-subtext)" }}>
          لا يُطلب تسجيل مراجعة يوم السبت - هذا يوم المراجعة الشاملة بالحلقة.
        </p>
      ) : (
        <>
          <YesNoButtons value={value} onChange={handleChange} disabled={isPending} />
          {error && (
            <p className="text-sm" style={{ color: "var(--color-red)" }}>
              {error}
            </p>
          )}
        </>
      )}
    </section>
  );
}
