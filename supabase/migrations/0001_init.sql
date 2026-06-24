-- ============================================================
-- منصة إدارة حلقة معاهدة القرآن الكريم - Schema v2 (مُعدّل)
-- تسجيل الدخول عبر البريد الإلكتروني + رمز OTP (مجاني بالكامل عبر Supabase)
-- بدلاً من رقم الهاتف + SMS (لتجنب تكاليف مزود SMS)
-- رقم الهاتف يبقى محفوظاً لأعراض التواصل/واتساب فقط، وليس وسيلة دخول
-- Supabase / PostgreSQL
-- ============================================================

-- ============================================================
-- 0. جدول مرجعي: ترتيب السور (لحساب "أيهما أبعد" بين نقطتين)
-- ============================================================
create table surahs (
  number integer primary key,        -- ترتيب السورة بالمصحف (1 = الفاتحة .. 114 = الناس)
  name text not null,                -- اسم السورة بالعربي
  ayah_count integer not null        -- عدد آيات السورة (لحساب التقدم)
);

-- ============================================================
-- 0.1 جدول مرجعي: خريطة المصحف المدني (604 صفحة) ↔ سورة/آية
-- يُستورد مرة واحدة عبر Claude Code من مصدر بيانات مفتوح (quran.com / Tanzil)
-- ============================================================
create table madani_mushaf_pages (
  page_number integer primary key check (page_number between 1 and 604),
  first_surah integer not null references surahs(number),
  first_ayah integer not null,
  last_surah integer not null references surahs(number),
  last_ayah integer not null
);

comment on table madani_mushaf_pages is 'مرجع تطابق دقيق بين رقم صفحة المصحف المدني (604 صفحة) وأول/آخر آية فيها. يُستورد جاهزاً وليس بإدخال يدوي.';

-- دالة: تحويل (سورة، آية) إلى رقم الصفحة المقابل في المصحف المدني
create or replace function ayah_to_page(p_surah integer, p_ayah integer)
returns integer as $$
  select page_number
  from madani_mushaf_pages
  where (first_surah, first_ayah) <= (p_surah, p_ayah)
    and (last_surah, last_ayah) >= (p_surah, p_ayah)
  limit 1;
$$ language sql stable;

comment on function ayah_to_page is 'يحول موقع سورة/آية لرقم الصفحة المقابل بالمصحف المدني';

-- ============================================================
-- 1. جدول الطلاب
-- ============================================================
create type approval_status as enum ('pending', 'approved', 'rejected');

create type review_direction as enum ('forward', 'backward');

create table students (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,

  -- البريد الإلكتروني هو وسيلة الدخول الوحيدة (Supabase Email OTP، مجاني، بلا رسوم SMS)
  email text not null unique,

  -- رقم الهاتف يُحفظ فقط لأعراض التواصل (واتساب) وليس وسيلة دخول
  phone text unique,

  joined_at timestamptz default now(),

  approval_status approval_status not null default 'pending',
  approved_at timestamptz,

  current_surah integer references surahs(number),
  current_ayah integer,
  current_page integer references madani_mushaf_pages(page_number),

  start_surah integer references surahs(number),
  start_ayah integer,

  review_direction review_direction not null default 'forward',

  daily_new_ayahs integer not null default 10,

  is_active boolean default true,
  notes text
);

comment on column students.email is 'البريد الإلكتروني - وسيلة الدخول الوحيدة عبر Supabase Email OTP';
comment on column students.phone is 'رقم الهاتف لأعراض التواصل وواتساب فقط - ليس وسيلة دخول';
comment on column students.approval_status is 'pending = سجل بإيميله وينتظر تفعيل المعلم (يشوف رابط واتساب الحلقة فقط) | approved = مفعّل وله وصول كامل لوحته';
comment on column students.current_surah is 'رقم السورة لآخر نقطة محفوظة معتمدة - NULL لحد ما يحددها المعلم وقت تفعيل الطالب';
comment on column students.current_ayah is 'رقم الآية لآخر نقطة محفوظة معتمدة - NULL لحد ما يحددها المعلم وقت تفعيل الطالب';
comment on column students.start_surah is 'نقطة بداية الطالب الأصلية (ثابتة، لا تتعير) - تُستخدم كحد المراجعة في الاتجاه forward';
comment on column students.review_direction is 'اتجاه الحفظ والمراجعة لهذا الطالب، قابل للتعديل اليدوي من المعلم';
comment on column students.daily_new_ayahs is 'تقدير عدد الآيات المتوقع حفظها بين كل حصتين تسميع، يُعدّل يدوياً من المعلم';

-- ============================================================
-- 2. إعدادات الحلقة (صف واحد)
-- ============================================================
create table halaqa_settings (
  id integer primary key default 1,
  halaqa_name text not null default 'حلقة معاهدة القرآن الكريم',
  teacher_name text not null default 'متوكل عبدالله حسن',
  meeting_link text default 'https://meet.google.com/kqj-squd-iqj',
  whatsapp_group_link text default 'https://chat.whatsapp.com/Ks1GOT6Y7zj9TPKKE9EFyI?s=cl&p=a&mlu=4',

  -- حالة الحلقة المباشرة: يتحكم بها المعلم يدوياً فقط (زر "بدأ الحلقة" / "إنهاء الحلقة")
  live_status text not null default 'not_started' check (live_status in ('not_started','live','ended')),

  tasmee_days int[] default '{0,3}',
  tasmee_start_time time default '18:00',
  tasmee_end_time time default '19:30',

  review_days int[] default '{6}',
  review_start_time time default '16:00',
  review_end_time time default '18:00',

  hifz_homework_days int[] default '{1,2,4,5}',
  daily_review_required_days int[] default '{0,1,2,3,4,5}',

  constraint single_row check (id = 1)
);

comment on column halaqa_settings.teacher_name is 'اسم خادم/معلم الحلقة، يُعرض بترويسة لوحة المعلم';
comment on column halaqa_settings.live_status is 'حالة بث الحلقة الآن - يتحكم بها المعلم يدوياً بزر واحد، لا يوجد توقيت تلقائي';

insert into halaqa_settings (id) values (1);

-- ============================================================
-- 3. الحصص
-- ============================================================
create type session_type as enum ('tasmee', 'review', 'monthly_sard');

create table sessions (
  id uuid primary key default gen_random_uuid(),
  halaqa_number integer not null unique,
  session_date date not null,
  session_type session_type not null,
  meeting_link text,
  notes text,
  created_at timestamptz default now()
);

-- ============================================================
-- 4. التقارير
-- ============================================================
create type completion_status as enum ('completed', 'partial', 'not_completed', 'absent');

create table reports (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references sessions(id) on delete cascade,
  student_id uuid not null references students(id) on delete cascade,

  from_surah integer not null references surahs(number),
  from_ayah integer not null,
  to_surah integer not null references surahs(number),
  to_ayah integer not null,

  from_page integer references madani_mushaf_pages(page_number),
  to_page integer references madani_mushaf_pages(page_number),

  raw_range_text text,

  status completion_status not null default 'not_completed',
  itqan_score numeric(4,2),
  teacher_notes text,
  recorded_at timestamptz default now(),

  unique(session_id, student_id)
);

comment on column reports.raw_range_text is 'الوصف الحر الكامل للمقرر كما يكتبه المعلم، مهم للحالات المركبة من عدة سور عير متصلة';

-- ============================================================
-- 5. الحضور
-- ============================================================
create table attendance (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references sessions(id) on delete cascade,
  student_id uuid not null references students(id) on delete cascade,
  present boolean not null default true,
  excuse_reason text,
  unique(session_id, student_id)
);

-- ============================================================
-- 5.1 المراجعة اليومية الذاتية
-- ============================================================
create table daily_self_review (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references students(id) on delete cascade,
  review_date date not null,
  reviewed boolean not null,
  recorded_at timestamptz default now(),

  unique(student_id, review_date)
);

comment on table daily_self_review is 'تسجيل ذاتي يومي بسيط (✅/❌) من الطالب لالتزامه بالمراجعة التراكمية. لا يُطلب يوم السبت.';

create or replace function check_not_saturday()
returns trigger as $$
begin
  if extract(dow from new.review_date) = 6 then
    raise exception 'لا يُسجّل تسجيل مراجعة ذاتية يوم السبت — هذا يوم المراجعة الشاملة والاختبار بالحلقة';
  end if;
  return new;
end;
$$ language plpgsql;

create trigger trg_no_saturday_self_review
  before insert or update on daily_self_review
  for each row execute function check_not_saturday();

-- ============================================================
-- 5.2 مقرر مراجعة الأسبوع
-- ============================================================
create table weekly_review_assignment (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references students(id) on delete cascade,
  week_start date not null,

  from_page integer not null references madani_mushaf_pages(page_number),
  to_page integer not null references madani_mushaf_pages(page_number),

  direction review_direction not null,

  created_at timestamptz default now(),
  unique(student_id, week_start)
);

comment on table weekly_review_assignment is 'مقرر المراجعة الذي يحدده المعلم يدوياً لكل طالب كل أسبوع';

-- ============================================================
-- 5.3 التوزيع اليومي المحسوب من مقرر الأسبوع
-- ============================================================
create table daily_review_schedule (
  id uuid primary key default gen_random_uuid(),
  weekly_assignment_id uuid not null references weekly_review_assignment(id) on delete cascade,
  student_id uuid not null references students(id) on delete cascade,
  schedule_date date not null,

  from_surah integer not null references surahs(number),
  from_ayah integer not null,
  to_surah integer not null references surahs(number),
  to_ayah integer not null,
  from_page integer references madani_mushaf_pages(page_number),
  to_page integer references madani_mushaf_pages(page_number),

  is_manually_edited boolean default false,
  created_at timestamptz default now(),

  unique(student_id, schedule_date)
);

comment on table daily_review_schedule is 'النصيب اليومي المحسوب تلقائياً من مقرر الأسبوع، موزّع بالتساوي على 6 أيام (أحد-جمعة)';

-- ============================================================
-- 5.4 دالة: توليد التوزيع اليومي تلقائياً من مقرر الأسبوع
-- ============================================================
create or replace function generate_daily_review_schedule(p_weekly_assignment_id uuid)
returns void as $$
declare
  v_assignment weekly_review_assignment%rowtype;
  v_total_pages integer;
  v_pages_per_day numeric;
  v_current_page integer;
  v_day_offset integer;
  v_day_date date;
  v_day_from_page integer;
  v_day_to_page integer;
  v_from_ayah_info record;
  v_to_ayah_info record;
begin
  select * into v_assignment from weekly_review_assignment where id = p_weekly_assignment_id;

  v_total_pages := abs(v_assignment.to_page - v_assignment.from_page) + 1;
  v_pages_per_day := v_total_pages / 6.0;

  delete from daily_review_schedule
  where student_id = v_assignment.student_id
    and schedule_date >= v_assignment.week_start
    and schedule_date < v_assignment.week_start + 6;

  v_current_page := v_assignment.from_page;

  for v_day_offset in 0..5 loop
    v_day_date := v_assignment.week_start + v_day_offset;

    if v_assignment.direction = 'forward' then
      if v_day_offset = 5 then
        v_day_to_page := v_assignment.to_page;
      else
        v_day_to_page := least(v_assignment.to_page, round(v_current_page + v_pages_per_day - 1)::integer);
      end if;
      v_day_from_page := v_current_page;
    else
      if v_day_offset = 5 then
        v_day_to_page := v_assignment.to_page;
      else
        v_day_to_page := greatest(v_assignment.to_page, round(v_current_page - v_pages_per_day + 1)::integer);
      end if;
      v_day_from_page := v_current_page;
    end if;

    select first_surah, first_ayah into v_from_ayah_info from madani_mushaf_pages where page_number = v_day_from_page;
    select last_surah, last_ayah into v_to_ayah_info from madani_mushaf_pages where page_number = v_day_to_page;

    insert into daily_review_schedule (
      weekly_assignment_id, student_id, schedule_date,
      from_surah, from_ayah, to_surah, to_ayah, from_page, to_page
    ) values (
      p_weekly_assignment_id, v_assignment.student_id, v_day_date,
      v_from_ayah_info.first_surah, v_from_ayah_info.first_ayah,
      v_to_ayah_info.last_surah, v_to_ayah_info.last_ayah,
      v_day_from_page, v_day_to_page
    );

    if v_assignment.direction = 'forward' then
      v_current_page := v_day_to_page + 1;
    else
      v_current_page := v_day_to_page - 1;
    end if;
  end loop;
end;
$$ language plpgsql;

comment on function generate_daily_review_schedule is 'يوزّع مقرر الأسبوع تلقائياً وبالتساوي على 6 أيام بالصفحات، ويثبّت رقم الآية الدقيق لكل يوم.';

-- ============================================================
-- 6. السرد الشهري
-- ============================================================
create table monthly_sard (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references students(id) on delete cascade,
  month_date date not null,

  from_surah integer not null references surahs(number),
  from_ayah integer not null,
  to_surah integer not null references surahs(number),
  to_ayah integer not null,

  status completion_status not null default 'not_completed',
  itqan_score numeric(4,2),
  teacher_notes text,
  recorded_at timestamptz default now(),

  unique(student_id, month_date)
);

-- ============================================================
-- 7. دالة: مقارنة موقعين (سورة/آية)
-- ============================================================
create or replace function position_rank(p_surah integer, p_ayah integer)
returns numeric as $$
declare
  v_ayahs_before integer;
begin
  select coalesce(sum(ayah_count), 0)
  into v_ayahs_before
  from surahs
  where number < p_surah;

  return v_ayahs_before + p_ayah;
end;
$$ language plpgsql immutable;

comment on function position_rank is 'يحول موقع (سورة، آية) لرقم تراكمي واحد قابل للمقارنة والترتيب';

-- ============================================================
-- 8. دالة: حساب مقرر التسميع القادم تلقائياً
-- ============================================================
create or replace function get_next_tasmee_assignment(p_student_id uuid)
returns table(from_surah integer, from_ayah integer, to_surah integer, to_ayah integer) as $$
declare
  v_surah integer;
  v_ayah integer;
  v_daily integer;
  v_surah_ayah_count integer;
  v_remaining integer;
begin
  select current_surah, current_ayah, daily_new_ayahs
  into v_surah, v_ayah, v_daily
  from students where id = p_student_id;

  from_surah := v_surah;
  from_ayah := v_ayah;
  v_remaining := v_daily;

  loop
    select ayah_count into v_surah_ayah_count from surahs where number = v_surah;
    if v_ayah + v_remaining <= v_surah_ayah_count then
      to_surah := v_surah;
      to_ayah := v_ayah + v_remaining;
      exit;
    else
      v_remaining := v_remaining - (v_surah_ayah_count - v_ayah);
      v_surah := v_surah + 1;
      v_ayah := 1;
      if v_surah > 114 then
        to_surah := 114; to_ayah := 6; exit;
      end if;
    end if;
  end loop;

  return next;
end;
$$ language plpgsql;

-- ============================================================
-- 9. دالة: تفعيل طالب جديد
-- ============================================================
create or replace function approve_student(
  p_student_id uuid,
  p_start_surah integer,
  p_start_ayah integer,
  p_daily_new_ayahs integer default 10
)
returns void as $$
begin
  update students
  set
    approval_status = 'approved',
    approved_at = now(),
    start_surah = p_start_surah,
    start_ayah = p_start_ayah,
    current_surah = p_start_surah,
    current_ayah = p_start_ayah,
    current_page = ayah_to_page(p_start_surah, p_start_ayah),
    daily_new_ayahs = p_daily_new_ayahs
  where id = p_student_id;
end;
$$ language plpgsql security definer;

comment on function approve_student is 'يُستدعى من لوحة المعلم فقط (عبر service_role) عند تفعيل طالب جديد كان pending';

-- ============================================================
-- 10. Views مساعدة للوحة التحكم
-- ============================================================
create view latest_report_status as
select distinct on (r.student_id)
  r.student_id, r.status, r.from_surah, r.from_ayah, r.to_surah, r.to_ayah,
  r.itqan_score, s.session_date, s.session_type, s.halaqa_number
from reports r
join sessions s on s.id = r.session_id
order by r.student_id, s.session_date desc, r.recorded_at desc;

create view student_progress as
select
  id, full_name, current_surah, current_ayah,
  position_rank(current_surah, current_ayah) as ayahs_memorized,
  round(position_rank(current_surah, current_ayah) / 6236.0 * 100, 1) as percent_of_quran
from students
where is_active = true;

create view weekly_review_readiness as
select
  s.id as student_id,
  s.full_name,
  count(*) filter (where d.reviewed = true) as days_reviewed,
  count(*) filter (where d.reviewed = false) as days_missed,
  6 - count(d.id) as days_not_recorded
from students s
left join daily_self_review d
  on d.student_id = s.id
  and d.review_date >= current_date - interval '6 days'
  and d.review_date < date_trunc('week', current_date) + interval '6 days'
where s.is_active = true
group by s.id, s.full_name;

comment on view weekly_review_readiness is 'ملخص أسبوعي (الأحد-الجمعة) لالتزام كل طالب بالمراجعة الذاتية اليومية';

create view pending_students as
select id, full_name, email, phone, joined_at
from students
where approval_status = 'pending'
order by joined_at asc;

comment on view pending_students is 'الطلاب الذين سجلوا بإيميلهم وينتظرون أن يُفعّلهم المعلم يدوياً';

-- ============================================================
-- 11. Row Level Security
-- ============================================================
alter table students enable row level security;
alter table sessions enable row level security;
alter table reports enable row level security;
alter table attendance enable row level security;
alter table monthly_sard enable row level security;
alter table halaqa_settings enable row level security;
alter table surahs enable row level security;
alter table madani_mushaf_pages enable row level security;
alter table daily_self_review enable row level security;
alter table weekly_review_assignment enable row level security;
alter table daily_review_schedule enable row level security;

create policy "students_select_own" on students for select using (auth.uid() = id);

create or replace function is_approved_student()
returns boolean as $$
  select coalesce(
    (select approval_status = 'approved' from students where id = auth.uid()),
    false
  );
$$ language sql stable security definer;

comment on function is_approved_student is 'تتحقق أن المستخدم الحالي طالب مفعّل (approved)، تُستخدم بكل policy يحتاج تقييد الوصول';

create policy "reports_select_own" on reports for select using (auth.uid() = student_id and is_approved_student());
create policy "attendance_select_own" on attendance for select using (auth.uid() = student_id and is_approved_student());
create policy "monthly_sard_select_own" on monthly_sard for select using (auth.uid() = student_id and is_approved_student());
create policy "sessions_select_all" on sessions for select using (auth.role() = 'authenticated' and is_approved_student());
create policy "settings_select_all" on halaqa_settings for select using (auth.role() = 'authenticated');
create policy "surahs_select_all" on surahs for select using (true);
create policy "mushaf_pages_select_all" on madani_mushaf_pages for select using (true);

create policy "self_review_select_own" on daily_self_review
  for select using (auth.uid() = student_id and is_approved_student());
create policy "self_review_insert_own" on daily_self_review
  for insert with check (auth.uid() = student_id and is_approved_student());
create policy "self_review_update_own" on daily_self_review
  for update using (auth.uid() = student_id and is_approved_student());

create policy "weekly_assignment_select_own" on weekly_review_assignment
  for select using (auth.uid() = student_id and is_approved_student());
create policy "daily_schedule_select_own" on daily_review_schedule
  for select using (auth.uid() = student_id and is_approved_student());

-- ملاحظة: عمليات المعلم (إدخال/تعديل) تُدار عبر service_role من Server Actions في Next.js
