export type ReviewDirection = "forward" | "backward";

export interface DailyPageRange {
  dayOffset: number;
  fromPage: number;
  toPage: number;
}

// يوزّع نطاق الصفحات على 6 أيام (الأحد إلى الجمعة) بالتساوي - مطابق لمنطق
// دالة generate_daily_review_schedule في قاعدة البيانات (تُستخدم هنا للمعاينة الفورية في الواجهة)
export function distributePages(
  fromPage: number,
  toPage: number,
  direction: ReviewDirection
): DailyPageRange[] {
  const totalPages = Math.abs(toPage - fromPage) + 1;
  const pagesPerDay = totalPages / 6;

  const days: DailyPageRange[] = [];
  let currentPage = fromPage;

  for (let dayOffset = 0; dayOffset <= 5; dayOffset++) {
    let dayFromPage: number;
    let dayToPage: number;

    if (direction === "forward") {
      dayFromPage = currentPage;
      dayToPage =
        dayOffset === 5
          ? toPage
          : Math.min(toPage, Math.round(currentPage + pagesPerDay - 1));
    } else {
      dayFromPage = currentPage;
      dayToPage =
        dayOffset === 5
          ? toPage
          : Math.max(toPage, Math.round(currentPage - pagesPerDay + 1));
    }

    days.push({ dayOffset, fromPage: dayFromPage, toPage: dayToPage });

    currentPage = direction === "forward" ? dayToPage + 1 : dayToPage - 1;
  }

  return days;
}

// رقم الصفحة المقابل لآية معيّنة بالاعتماد على جدول صفحات المصحف المدني المُمرّر
export function findPageForAyah(
  pages: { page_number: number; first_surah: number; first_ayah: number; last_surah: number; last_ayah: number }[],
  surah: number,
  ayah: number
): number | null {
  for (const page of pages) {
    const afterStart =
      surah > page.first_surah || (surah === page.first_surah && ayah >= page.first_ayah);
    const beforeEnd =
      surah < page.last_surah || (surah === page.last_surah && ayah <= page.last_ayah);
    if (afterStart && beforeEnd) return page.page_number;
  }
  return null;
}
