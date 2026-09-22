import { cn } from "@/lib/utils";
import { toneClass, type Tone } from "@/lib/statusStyles";
import { motion } from "framer-motion";
import type { ReactNode } from "react";

const EASE = [0.22, 1, 0.36, 1] as const;

/* ------------------------------------------------------------------ *
 * Shared furniture for the signed-in pages.
 *
 * Before this, each role's pages invented their own: some opened with the
 * navy `dashboard-hero` banner, some with a bare `<h1 class="text-2xl">`,
 * and stat tiles were rebuilt from scratch on five screens. Everything in
 * here is presentational — no page logic moved into it.
 * ------------------------------------------------------------------ */

/** Page canvas. Every route inside AppLayout opens with one of these. */
export const PageShell = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => (
  <div className={cn("dashboard-surface space-y-6", className)}>{children}</div>
);

/**
 * The banner at the top of a page.
 *
 * `variant="hero"` is the navy gradient used for a role's landing screen;
 * `variant="plain"` is the lighter treatment for the pages below it, so the
 * dark banner keeps its meaning instead of appearing on all nine screens.
 */
export const PageHeader = ({
  title,
  description,
  icon,
  actions,
  variant = "plain",
  children,
}: {
  title: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  actions?: ReactNode;
  variant?: "hero" | "plain";
  children?: ReactNode;
}) => {
  if (variant === "hero") {
    return (
      <motion.header
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: EASE }}
        className="dashboard-hero"
      >
        <div className="dashboard-hero__grid" aria-hidden="true" />
        <span
          className="dashboard-hero__glow dashboard-hero__glow--primary"
          aria-hidden="true"
        />
        <span
          className="dashboard-hero__glow dashboard-hero__glow--secondary"
          aria-hidden="true"
        />

        <div className="relative flex flex-wrap items-center justify-between gap-5">
          <div className="flex min-w-0 items-center gap-4">
            {icon ? (
              <span className="flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl bg-white/12 text-xl text-white ring-1 ring-inset ring-white/20 backdrop-blur-sm">
                {icon}
              </span>
            ) : null}
            <div className="min-w-0">
              <h1 className="truncate font-display text-2xl font-extrabold tracking-tight text-white">
                {title}
              </h1>
              {description ? (
                <p className="mt-1 text-sm text-brand-100/75">{description}</p>
              ) : null}
            </div>
          </div>
          {actions ? (
            <div className="flex flex-wrap items-center gap-2.5">{actions}</div>
          ) : null}
        </div>

        {children ? <div className="relative mt-6">{children}</div> : null}
      </motion.header>
    );
  }

  return (
    <motion.header
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: EASE }}
      className="flex flex-wrap items-end justify-between gap-4"
    >
      <div className="flex min-w-0 items-center gap-3.5">
        {icon ? <span className="cc-icon-tile shrink-0">{icon}</span> : null}
        <div className="min-w-0">
          <h1 className="truncate font-display text-2xl font-extrabold tracking-tight">
            {title}
          </h1>
          {description ? (
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>
      </div>
      {actions ? (
        <div className="flex flex-wrap items-center gap-2.5">{actions}</div>
      ) : null}
    </motion.header>
  );
};

/** Responsive row of stat tiles. */
export const StatGrid = ({
  children,
  cols = 4,
}: {
  children: ReactNode;
  cols?: 2 | 3 | 4 | 5;
}) => (
  <div
    className={cn(
      "grid gap-4",
      cols === 2 && "grid-cols-2",
      cols === 3 && "grid-cols-2 lg:grid-cols-3",
      cols === 4 && "grid-cols-2 lg:grid-cols-4",
      cols === 5 && "grid-cols-2 md:grid-cols-3 lg:grid-cols-5",
    )}
  >
    {children}
  </div>
);

/**
 * One metric. Becomes a button when `onClick` is given, which is how the
 * complaint screens use the row as a status filter.
 */
export const StatCard = ({
  label,
  value,
  icon,
  tone,
  hint,
  active,
  onClick,
  index = 0,
}: {
  label: ReactNode;
  value: ReactNode;
  icon?: ReactNode;
  tone?: Tone;
  hint?: ReactNode;
  active?: boolean;
  onClick?: () => void;
  index?: number;
}) => {
  const interactive = typeof onClick === "function";

  const body = (
    <>
      {icon ? (
        <span
          className={cn(
            "mb-3 inline-flex h-9 w-9 items-center justify-center rounded-xl text-sm",
            tone ? `cc-badge ${toneClass(tone)}` : "dashboard-stat-icon",
          )}
        >
          {icon}
        </span>
      ) : null}
      <div className="font-display text-2xl font-extrabold tracking-tight">
        {value}
      </div>
      <div className="mt-0.5 text-xs font-medium text-muted-foreground">
        {label}
      </div>
      {hint ? (
        <div className="mt-1 text-[11px] text-muted-foreground/80">{hint}</div>
      ) : null}
    </>
  );

  const className = cn(
    "dashboard-card text-left",
    interactive && "cursor-pointer transition-colors hover:border-brand-500/40",
    active && "cc-ring-brand",
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05, ease: EASE }}
    >
      {interactive ? (
        <button
          type="button"
          onClick={onClick}
          aria-pressed={active}
          className={cn(className, "w-full")}
        >
          {body}
        </button>
      ) : (
        <div className={className}>{body}</div>
      )}
    </motion.div>
  );
};

/** A titled block of content. */
export const SectionCard = ({
  title,
  description,
  actions,
  children,
  className,
  bodyClassName,
}: {
  title?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}) => (
  <section className={cn("dashboard-card", className)}>
    {(title || actions) && (
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          {title ? (
            <h2 className="font-display text-base font-bold tracking-tight">
              {title}
            </h2>
          ) : null}
          {description ? (
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>
        {actions ? <div className="shrink-0">{actions}</div> : null}
      </div>
    )}
    <div className={bodyClassName}>{children}</div>
  </section>
);

/** Consistent "nothing here" state. */
export const EmptyState = ({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
}) => (
  <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
    {icon ? (
      <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-xl text-muted-foreground">
        {icon}
      </span>
    ) : null}
    <p className="font-display text-base font-bold tracking-tight">{title}</p>
    {description ? (
      <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
        {description}
      </p>
    ) : null}
    {action ? <div className="mt-5">{action}</div> : null}
  </div>
);

/** Status / priority pill. */
export const Badge = ({
  tone = "neutral",
  dot,
  children,
  className,
}: {
  tone?: Tone;
  dot?: boolean;
  children: ReactNode;
  className?: string;
}) => (
  <span className={cn("cc-badge", toneClass(tone), className)}>
    {dot ? <span className="cc-badge__dot" /> : null}
    {children}
  </span>
);

/** Bare status dot for dense list rows. */
export const Dot = ({ tone = "neutral" }: { tone?: Tone }) => (
  <span className={cn("cc-dot", toneClass(tone))} />
);

/** Row wrapper used by the complaint and doubt lists. */
export const ListRow = ({
  onClick,
  children,
  index = 0,
  className,
}: {
  onClick?: () => void;
  children: ReactNode;
  index?: number;
  className?: string;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.32, delay: Math.min(index, 12) * 0.03, ease: EASE }}
  >
    <div
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      className={cn(
        "rounded-xl border border-border bg-card px-4 py-3.5 transition-colors",
        onClick && "cursor-pointer hover:border-brand-500/40 hover:bg-accent/40",
        className,
      )}
    >
      {children}
    </div>
  </motion.div>
);
