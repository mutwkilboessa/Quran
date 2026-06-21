-- ============================================================
-- جدول مسودة مؤقت: الطلاب العشرة الحاليون بالحلقة فعلياً
-- يُستخدم فقط لعرض/تجربة البيانات الحقيقية قبل ربط كل طالب بحساب
-- تسجيل دخول فعلي (بريد إلكتروني). يُنقل لاحقاً لجدول students الحقيقي
-- عبر شاشة "تفعيل طالب جديد" بلوحة المعلم، ثم يمكن حذف هذا الجدول.
-- ============================================================
create table students_draft (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  start_surah integer not null references surahs(number),
  start_ayah integer not null,
  current_surah integer not null references surahs(number),
  current_ayah integer not null,
  review_direction review_direction not null default 'forward',
  daily_new_ayahs integer not null default 10,
  notes text
);

comment on table students_draft is 'مسودة بيانات الطلاب الحاليين الفعليين بالحلقة، تُنقل لجدول students عند تفعيل كل طالب بحسابه الحقيقي.';

insert into students_draft (full_name, start_surah, start_ayah, current_surah, current_ayah, review_direction, daily_new_ayahs, notes) values
('محمد بشرى',   1, 1,  2, 181, 'forward',  10, null),
('حيدر',        1, 1,  2, 190, 'forward',  10, null),
('حسام',        114, 1, 57, 1,  'backward', 10, 'بدأ من الناس متجهاً للخلف. مقرره الأخير مركّب من 3 مقاطع غير متصلة: الدخان 40-59، الزخرف حتى 28، من الطور إلى الحديد — راجع التفاصيل الدقيقة يدوياً'),
('ناصر',        1, 1,  2, 169, 'forward',  10, null),
('إبراهيم',     78, 1, 97, 11, 'forward',  8,  'بدأ من النبأ (أول جزء عمّ) متجهاً نحو الناس. آخر نقطة محفوظة: سورة القدر'),
('عباس',        114, 1, 66, 1,  'backward', 10, 'بدأ من الناس متجهاً للخلف. مقرره الأخير مركّب: الزخرف حتى 73، من الجمعة إلى التحريم'),
('جبريل',       67, 1,  67, 30, 'forward',  10, 'بدأ من سورة الملك. أنهى السورة كاملة'),
('حاتم',        1, 1,  2, 101, 'forward',  10, null),
('محمد البدري', 1, 1,  2, 101, 'forward',  10, null),
('صهيب',        1, 1,  2, 162, 'forward',  10, 'طالب جديد، أُضيف بتاريخ 20 يونيو 2026');
