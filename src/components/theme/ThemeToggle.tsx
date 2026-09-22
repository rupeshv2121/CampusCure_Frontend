import { cn } from "@/lib/utils";
import { MoonOutlined, SunOutlined } from "@ant-design/icons";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

type ThemeToggleProps = {
  className?: string;
  /** `onDark` is for the navy bands, where the default border disappears. */
  tone?: "default" | "onDark";
  /** `switch` shows a labelled track; `icon` is the compact header button. */
  variant?: "icon" | "switch";
};

/**
 * Light/dark switch.
 *
 * `resolvedTheme` is only trustworthy once mounted — before that next-themes
 * has not read the stored preference, so rendering an icon early shows the
 * wrong one and then visibly flips. A same-sized placeholder holds the layout
 * until then.
 *
 * The button carries a resting border rather than revealing itself on hover:
 * as a bare icon it read as decoration and people did not find it.
 */
const ThemeToggle = ({
  className,
  tone = "default",
  variant = "icon",
}: ThemeToggleProps) => {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isDark = mounted && resolvedTheme === "dark";
  const label = isDark ? "Switch to light theme" : "Switch to dark theme";

  if (variant === "switch") {
    const track = cn(
      "relative inline-flex h-9 w-16 shrink-0 items-center rounded-full border p-1 transition-colors",
      tone === "onDark"
        ? "border-white/25 bg-white/10"
        : "border-border bg-muted",
      className,
    );

    if (!mounted) return <span className={track} aria-hidden="true" />;

    return (
      <button
        type="button"
        role="switch"
        aria-checked={isDark}
        aria-label={label}
        title={label}
        onClick={() => setTheme(isDark ? "light" : "dark")}
        className={track}
      >
        {/* The knob slides; the two icons stay put behind it. */}
        <span
          className={cn(
            "absolute flex h-7 w-7 items-center justify-center rounded-full bg-card text-xs shadow-[var(--shadow-sm)] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
            isDark ? "translate-x-7 text-brand-300" : "translate-x-0 text-brand-700",
          )}
        >
          {isDark ? <SunOutlined /> : <MoonOutlined />}
        </span>
      </button>
    );
  }

  const button = cn(
    "inline-flex h-9 w-9 items-center justify-center rounded-lg border transition-colors",
    tone === "onDark"
      ? "border-white/20 bg-white/5 text-white/85 hover:bg-white/15 hover:text-white"
      : "border-border bg-card text-muted-foreground hover:border-brand-500/40 hover:bg-accent hover:text-accent-foreground",
    className,
  );

  if (!mounted) return <span className={button} aria-hidden="true" />;

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={button}
      aria-label={label}
      title={label}
    >
      {isDark ? <SunOutlined /> : <MoonOutlined />}
    </button>
  );
};

export default ThemeToggle;
