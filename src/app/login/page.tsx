"use client";

import { Suspense, useState, useTransition, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import { requestLoginCode } from "./actions";
import { Icon } from "@/components/icons";

type Step = "email" | "sent";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const searchParams = useSearchParams();
  const [step, setStep] = useState<Step>("email");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(searchParams.get("error"));
  const [isPending, startTransition] = useTransition();

  function handleSendLink(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const formData = new FormData();
    formData.set("fullName", fullName);
    formData.set("email", email);
    startTransition(async () => {
      const result = await requestLoginCode(formData);
      if ("error" in result) setError(result.error);
      else setStep("sent");
    });
  }

  return (
    <main
      className="flex min-h-screen flex-col items-center justify-center px-6"
      style={{ background: "var(--color-gray-bg)" }}
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-sm border"
        style={{ borderColor: "var(--color-border)" }}
      >
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <div
            className="flex h-14 w-14 items-center justify-center rounded-full"
            style={{ background: "var(--color-green-bg)", color: "var(--color-green)" }}
          >
            <Icon.Book size={28} />
          </div>
          <h1 className="text-lg font-bold" style={{ color: "var(--color-text)" }}>
            حلقة معاهدة القران الكريم
          </h1>
          <p className="text-sm" style={{ color: "var(--color-subtext)" }}>
            {step === "email"
              ? "سجّل دخولك بالبريد الإلكتروني"
              : "تحقق من بريدك الإلكتروني"}
          </p>
        </div>

        {step === "email" ? (
          <form onSubmit={handleSendLink} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium" style={{ color: "var(--color-text)" }}>
                الاسم الكامل
              </label>
              <input
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="rounded-lg border px-3 py-2.5 text-sm outline-none"
                style={{ borderColor: "var(--color-border)" }}
                placeholder="معال: محمد عبدالله"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium" style={{ color: "var(--color-text)" }}>
                البريد الإلكتروني
              </label>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-lg border px-3 py-2.5 text-sm outline-none"
                style={{ borderColor: "var(--color-border)" }}
                placeholder="example@email.com"
                dir="ltr"
              />
            </div>
            {error && (
              <p className="text-sm" style={{ color: "var(--color-red)" }}>
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={isPending}
              className="mt-2 rounded-lg py-2.5 text-sm font-semibold text-white disabled:opacity-60"
              style={{ background: "var(--color-green)" }}
            >
              {isPending ? "جارٍ الإرسال..." : "إرسال رابط الدخول"}
            </button>
          </form>
        ) : (
          <div className="flex flex-col items-center gap-4 text-center">
            <p className="text-sm" style={{ color: "var(--color-text)" }}>
              أرسلنا رابط دخول إلى بريدك الإلكتروني{" "}
              <span dir="ltr" className="font-semibold">
                {email}
              </span>
              . اضغط على الرابط لإكمال تسجيل الدخول.
            </p>
            {error && (
              <p className="text-sm" style={{ color: "var(--color-red)" }}>
                {error}
              </p>
            )}
            <button
              type="button"
              onClick={() => setStep("email")}
              className="flex items-center justify-center gap-1 text-sm"
              style={{ color: "var(--color-gray)" }}
            >
              <Icon.ChevronLeft size={16} />
              تعديل البريد الإلكتروني
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
