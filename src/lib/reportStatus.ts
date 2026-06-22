export type ReportStatus = "completed" | "partial" | "not_completed" | "absent";

export const STATUS_LABEL: Record<ReportStatus, string> = {
  completed: "تم بالكامل",
  partial: "تم جزئياً",
  not_completed: "لم يُنجز",
  absent: "فياب",
};

export const STATUS_COLOR: Record<ReportStatus, { background: string; color: string }> = {
  completed: { background: "var(--color-green-bg)", color: "var(--color-green)" },
  partial: { background: "var(--color-gray-bg)", color: "var(--color-gray)" },
  not_completed: { background: "var(--color-red-bg)", color: "var(--color-red)" },
  absent: { background: "var(--color-red-bg)", color: "var(--color-red)" },
};

export const LABEL_TO_STATUS: Record<string, ReportStatus> = Object.fromEntries(
  Object.entries(STATUS_LABEL).map(([status, label]) => [label, status as ReportStatus])
);
