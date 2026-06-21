const KUWAIT_TZ = "Asia/Kuwait";

const WEEKDAY_INDEX: Record<string, number> = {
  Sunday: 0,
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
};

// رقم اليوم بالأسبوع بتوقيت الكويت (0 = أحد .. 6 = سبت) - ثابت بصرف النظر عن توقيت الجهاز
export function getKuwaitDayIndex(date: Date = new Date()): number {
  const weekday = new Intl.DateTimeFormat("en-US", {
    timeZone: KUWAIT_TZ,
    weekday: "long",
  }).format(date);
  return WEEKDAY_INDEX[weekday];
}

// تاريخ اليوم بصيفة YYYY-MM-DD بتوقيت الكويت
export function getKuwaitDateString(date: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: KUWAIT_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

// تاريخ يوم الأحد لبداية أسبوع التاريخ المعطى (بتوقيت الكويت)
export function getKuwaitWeekStart(date: Date = new Date()): string {
  const todayStr = getKuwaitDateString(date);
  const dayIndex = getKuwaitDayIndex(date);
  const d = new Date(`${todayStr}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() - dayIndex);
  return d.toISOString().slice(0, 10);
}

export function addDays(dateStr: string, days: number): string {
  const d = new Date(`${dateStr}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

// نص عربي طويل للتاريخ والوقت الحالي بتوقيت الكويت، مطابق للمرجع التصميمي
export function formatKuwaitNow(date: Date = new Date()): string {
  return new Intl.DateTimeFormat("ar-KW", {
    timeZone: KUWAIT_TZ,
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

export type DayType = "hifz" | "tasmee" | "review" | "off";

// نوع اليوم الحالي بناءً على إعدادات الحلقة: تسميع / حفظ منزلي / مراجعة شاملة (سبت) / إجازة
export function getDayType(
  dayIndex: number,
  settings: { tasmee_days: number[]; review_days: number[]; hifz_homework_days: number[] }
): DayType {
  if (settings.review_days.includes(dayIndex)) return "review";
  if (settings.tasmee_days.includes(dayIndex)) return "tasmee";
  if (settings.hifz_homework_days.includes(dayIndex)) return "hifz";
  return "off";
}
