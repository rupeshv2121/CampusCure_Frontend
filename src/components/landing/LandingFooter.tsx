import Wordmark from "@/components/brand/Wordmark";
import {
  GithubOutlined,
  LinkedinFilled,
  MailOutlined,
  TwitterOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const SOCIALS = [
  { icon: <TwitterOutlined />, href: "#", label: "Twitter" },
  { icon: <LinkedinFilled />, href: "#", label: "LinkedIn" },
  { icon: <GithubOutlined />, href: "#", label: "GitHub" },
  {
    icon: <MailOutlined />,
    href: "mailto:contact@campuscure.com",
    label: "Email",
  },
];

const scrollTo = (id: string) => () =>
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

const LandingFooter = () => {
  const navigate = useNavigate();
  const year = new Date().getFullYear();

  const groups = {
    Product: [
      { label: "Features", action: scrollTo("features") },
      { label: "How it works", action: scrollTo("how-it-works") },
      { label: "Benefits", action: scrollTo("benefits") },
      { label: "Testimonials", action: scrollTo("testimonials") },
    ],
    Platform: [
      { label: "Student portal", action: () => navigate("/login") },
      { label: "Faculty portal", action: () => navigate("/login") },
      { label: "Admin portal", action: () => navigate("/login") },
      { label: "Create an account", action: () => navigate("/register") },
    ],
    Legal: [
      { label: "Privacy policy", action: () => {} },
      { label: "Terms of service", action: () => {} },
      { label: "Cookie policy", action: () => {} },
    ],
  };

  return (
    <footer className="border-t border-border bg-surface">
      <div className="cc-container py-14">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Wordmark size="lg" tagline="Campus Operations" />

            <p className="mt-5 max-w-xs text-sm leading-relaxed text-muted-foreground">
              One workspace for campus complaints and academic doubts — with the
              reporting to show what actually got fixed.
            </p>

            <div className="mt-6 flex gap-2">
              {SOCIALS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground transition-colors hover:border-brand-500/40 hover:bg-brand-600 hover:text-white"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {Object.entries(groups).map(([group, links]) => (
            <nav key={group} aria-label={group}>
              <h2 className="font-display text-xs font-bold uppercase tracking-[0.14em] text-foreground">
                {group}
              </h2>
              <ul className="mt-4 space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <button
                      onClick={link.action}
                      className="text-sm text-muted-foreground transition-colors hover:text-brand-700"
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-border pt-7 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            &copy; {year} CampusCure. All rights reserved.
          </p>
          <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
            Built for campus communities
          </p>
        </div>
      </div>
    </footer>
  );
};

export default LandingFooter;
