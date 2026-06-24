"use client";

import { Icon } from "@/components/icons";

export default function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="no-print flex items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium"
      style={{ borderColor: "var(--color-border)", color: "var(--color-text)" }}
    >
      <Icon.Book size={16} />
      تحميل / طباعة التقرير
    </button>
  );
}
