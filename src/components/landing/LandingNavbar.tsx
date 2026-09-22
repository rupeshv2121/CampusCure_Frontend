import Wordmark from "@/components/brand/Wordmark";
import ThemeToggle from "@/components/theme/ThemeToggle";
import { cn } from "@/lib/utils";
import { CloseOutlined, MenuOutlined } from "@ant-design/icons";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface LandingNavbarProps {
  scrolled: boolean;
}

const NAV_LINKS = [
  { label: "Features", id: "features" },
  { label: "How It Works", id: "how-it-works" },
  { label: "Benefits", id: "benefits" },
  { label: "Testimonials", id: "testimonials" },
  { label: "FAQ", id: "faq" },
];

const LandingNavbar = ({ scrolled }: LandingNavbarProps) => {
  const navigate = useNavigate();
  const [mobileMenu, setMobileMenu] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  /**
   * Highlights the link for the section currently under the header.
   *
   * This replaces a `elementsFromPoint` hit-test that ran on every scroll
   * event and forced a layout each time. IntersectionObserver does the same
   * job off the main thread; the root margin box is the strip just below the
   * floating bar, so a section counts as "current" once it reaches the header.
   */
  useEffect(() => {
    const sections = NAV_LINKS.map((l) => document.getElementById(l.id)).filter(
      (el): el is HTMLElement => Boolean(el),
    );
    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible) setActiveId(visible.target.id);
      },
      { rootMargin: "-88px 0px -65% 0px", threshold: 0 },
    );

    sections.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // A locked body behind an open sheet stops the page scrolling underneath it.
  useEffect(() => {
    if (!mobileMenu) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [mobileMenu]);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMobileMenu(false);
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-3 sm:pt-4">
      <motion.nav
        initial={{ y: -24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className={cn(
          "w-full max-w-5xl rounded-2xl transition-[background-color,box-shadow,border-color] duration-300",
          "border backdrop-blur-xl",
          scrolled || mobileMenu
            ? "border-border bg-card/85 shadow-[var(--shadow-md)]"
            : "border-transparent bg-card/50 shadow-none",
        )}
      >
        <div className="flex h-15 items-center justify-between gap-4 px-4 sm:px-5">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="rounded-xl outline-none"
            aria-label="CampusCure, back to top"
          >
            <Wordmark size="sm" />
          </button>

          <div className="hidden items-center gap-0.5 md:flex">
            {NAV_LINKS.map((link) => {
              const active = activeId === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => scrollTo(link.id)}
                  className={cn(
                    "relative rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {/* Shared layout id slides the pill between links instead of
                      cross-fading two of them. */}
                  {active && (
                    <motion.span
                      layoutId="nav-active-pill"
                      className="absolute inset-0 -z-10 rounded-lg bg-accent"
                      transition={{
                        type: "spring",
                        stiffness: 420,
                        damping: 34,
                      }}
                    />
                  )}
                  {link.label}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-1.5">
            <ThemeToggle />

            <button
              onClick={() => navigate("/login")}
              className="cc-btn cc-btn-ghost cc-btn--sm hidden sm:inline-flex"
            >
              Log in
            </button>
            <button
              onClick={() => navigate("/register")}
              className="cc-btn cc-btn-primary cc-btn--sm hidden sm:inline-flex"
            >
              Get Started
            </button>

            <button
              onClick={() => setMobileMenu((open) => !open)}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-accent md:hidden"
              aria-label={mobileMenu ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenu}
            >
              {mobileMenu ? <CloseOutlined /> : <MenuOutlined />}
            </button>
          </div>
        </div>

        <AnimatePresence initial={false}>
          {mobileMenu && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden border-t border-border md:hidden"
            >
              <div className="space-y-1 px-3 py-3">
                {NAV_LINKS.map((link) => (
                  <button
                    key={link.id}
                    onClick={() => scrollTo(link.id)}
                    className="w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                  >
                    {link.label}
                  </button>
                ))}
                <div className="grid grid-cols-2 gap-2 border-t border-border pt-3">
                  <button
                    onClick={() => {
                      setMobileMenu(false);
                      navigate("/login");
                    }}
                    className="cc-btn cc-btn-secondary cc-btn--sm w-full"
                  >
                    Log in
                  </button>
                  <button
                    onClick={() => {
                      setMobileMenu(false);
                      navigate("/register");
                    }}
                    className="cc-btn cc-btn-primary cc-btn--sm w-full"
                  >
                    Get Started
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </header>
  );
};

export default LandingNavbar;
