"use client";

import type { ReactNode } from "react";

type IconProps = {
  size?: number;
  className?: string;
  strokeWidth?: number;
};

function base(children: ReactNode, { size = 20, className, strokeWidth = 2 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {children}
    </svg>
  );
}

export const Icon = {
  Check: (props: IconProps = {}) => base(<polyline points="20 6 9 17 4 12" />, props),

  X: (props: IconProps = {}) =>
    base(
      <>
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </>,
      props
    ),

  ChevronLeft: (props: IconProps = {}) => base(<polyline points="15 18 9 12 15 6" />, props),

  Book: (props: IconProps = {}) =>
    base(
      <>
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </>,
      props
    ),

  Refresh: (props: IconProps = {}) =>
    base(
      <>
        <polyline points="23 4 23 10 17 10" />
        <polyline points="1 20 1 14 7 14" />
        <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10" />
        <path d="M20.49 15a9 9 0 0 1-14.85 3.36L1 14" />
      </>,
      props
    ),

  Link: (props: IconProps = {}) =>
    base(
      <>
        <path d="M10 13a5 5 0 0 0 7.07 0l2.83-2.83a5 5 0 0 0-7.07-7.07L11.5 4.5" />
        <path d="M14 11a5 5 0 0 0-7.07 0L4.1 13.83a5 5 0 0 0 7.07 7.07L12.5 19.5" />
      </>,
      props
    ),

  Play: (props: IconProps = {}) => base(<polygon points="6 3 20 12 6 21 6 3" />, props),

  Stop: (props: IconProps = {}) =>
    base(<rect x="5" y="5" width="14" height="14" rx="2" />, props),

  User: (props: IconProps = {}) =>
    base(
      <>
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </>,
      props
    ),

  Calendar: (props: IconProps = {}) =>
    base(
      <>
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </>,
      props
    ),

  Bookmark: (props: IconProps = {}) =>
    base(<path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />, props),

  Sparkle: (props: IconProps = {}) =>
    base(
      <path d="M12 2l1.8 5.6L19.5 9l-5.7 1.4L12 16l-1.8-5.6L4.5 9l5.7-1.4L12 2z" />,
      props
    ),
};

export function StatusCircle({
  status,
  size = 56,
}: {
  status: "success" | "fail" | "neutral";
  size?: number;
}) {
  const styles = {
    success: { bg: "var(--color-green-bg)", fg: "var(--color-green)" },
    fail: { bg: "var(--color-red-bg)", fg: "var(--color-red)" },
    neutral: { bg: "var(--color-gray-bg)", fg: "var(--color-gray)" },
  }[status];

  return (
    <div
      className="flex items-center justify-center rounded-full shrink-0"
      style={{ width: size, height: size, background: styles.bg, color: styles.fg }}
    >
      {status === "fail" ? <Icon.X size={size * 0.45} strokeWidth={2.5} /> : <Icon.Check size={size * 0.45} strokeWidth={2.5} />}
    </div>
  );
}

export function YesNoButtons({
  value,
  onChange,
  disabled = false,
}: {
  value: boolean | null;
  onChange: (value: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex gap-2">
      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange(true)}
        className="flex items-center justify-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium border transition-colors disabled:opacity-50"
        style={
          value === true
            ? { background: "var(--color-green)", color: "#fff", borderColor: "var(--color-green)" }
            : { background: "#fff", color: "var(--color-text)", borderColor: "var(--color-border)" }
        }
      >
        <Icon.Check size={16} />
        نعم
      </button>
      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange(false)}
        className="flex items-center justify-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium border transition-colors disabled:opacity-50"
        style={
          value === false
            ? { background: "var(--color-red)", color: "#fff", borderColor: "var(--color-red)" }
            : { background: "#fff", color: "var(--color-text)", borderColor: "var(--color-border)" }
        }
      >
        <Icon.X size={16} />
        لا
      </button>
    </div>
  );
}
