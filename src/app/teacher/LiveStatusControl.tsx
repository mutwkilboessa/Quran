"use client";

import { useTransition } from "react";
import { setLiveStatus } from "./actions";
import { Icon } from "@/components/icons";

type LiveStatus = "not_started" | "live" | "ended";

export default function LiveStatusControl({
  liveStatus,
  meetingLink,
}: {
  liveStatus: LiveStatus;
  meetingLink: string | null;
}) {
  const [isPending, startTransition] = useTransition();
  const isLive = liveStatus === "live";

  function toggle() {
    startTransition(() => setLiveStatus(isLive ? "ended" : "live"));
  }

  return (
    <div
      className="rounded-2xl bg-white p-4 shadow-sm border"
      style={{ borderColor: "var(--color-border)" }}
    >
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-bold" style={{ color: "var(--color-text)" }}>
          حالة الحلقة الآن
        </span>
        <span
          className="rounded-full px-2.5 py-1 text-xs font-semibold"
          style={
            isLive
              ? { background: "var(--color-green-bg)", color: "var(--color-green)" }
              : { background: "var(--color-gray-bg)", color: "var(--color-gray)" }
          }
        >
          {isLive ? "مباشرة الآن" : liveStatus === "ended" ? "انتهت" : "لم تبدأ"}
        </span>
      </div>

      <button
        type="button"
        disabled={isPending}
        onClick={toggle}
        className="flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold text-white disabled:opacity-60"
        style={{ background: isLive ? "var(--color-red)" : "var(--color-green)" }}
      >
        {isLive ? <Icon.Stop size={16} /> : <Icon.Play size={16} />}
        {isPending ? "جارٍ التحديث..." : isLive ? "إنهاء الحلقة" : "بدء الحلقة الآن"}
      </button>

      {meetingLink && (
        <a
          href={meetingLink}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg border py-2.5 text-sm font-medium"
          style={{ borderColor: "var(--color-border)", color: "var(--color-text)" }}
        >
          <Icon.Link size={16} />
          فتح رابط الاجتماع
        </a>
      )}
    </div>
  );
}
