import {
  CheckCircleOutlined,
  FormOutlined,
  SearchOutlined,
  UserAddOutlined,
} from "@ant-design/icons";
import { motion } from "framer-motion";

const STEPS = [
  {
    icon: <UserAddOutlined />,
    title: "Sign up",
    desc: "Create an account as a student, faculty member or administrator. Your role decides what you land on.",
    tile: "",
  },
  {
    icon: <FormOutlined />,
    title: "Submit & track",
    desc: "Report a complaint or ask a doubt. Both stay visible on your dashboard from the moment you post them.",
    tile: "cc-icon-tile--violet",
  },
  {
    icon: <SearchOutlined />,
    title: "Review & assign",
    desc: "Administrators triage what comes in and hand it to the faculty or facilities team that can actually fix it.",
    tile: "cc-icon-tile--amber",
  },
  {
    icon: <CheckCircleOutlined />,
    title: "Resolved",
    desc: "You are notified the moment your complaint closes or your doubt gets a verified answer.",
    tile: "cc-icon-tile--emerald",
  },
];

const EASE = [0.22, 1, 0.36, 1] as const;

const HowItWorksSection = () => (
  <section id="how-it-works" className="cc-section cc-section--muted">
    <div className="cc-container">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.55, ease: EASE }}
        className="cc-section-head"
      >
        <span className="cc-eyebrow">How it works</span>
        <h2 className="cc-h2">
          From signup to <span className="cc-gradient-text">resolution</span>
        </h2>
        <p className="cc-lede">
          Four steps, and the same four steps whether it is a broken projector
          or a question about database indexes.
        </p>
      </motion.div>

      <div className="relative">
        {/* Rail connecting the steps. Drawn once behind the row rather than as
            a fragment per card, so it stays continuous and lines up with the
            icon centres (top 1.75rem = half of the 3.5rem tile). */}
        <div
          aria-hidden="true"
          className="absolute left-0 right-0 top-7 hidden h-px bg-linear-to-r from-transparent via-border to-transparent lg:block"
        />

        <ol className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, i) => (
            <motion.li
              key={step.title}
              initial={{ opacity: 0, y: 26 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.1, ease: EASE }}
              className="group relative"
            >
              <span
                className={
                  "cc-icon-tile cc-icon-tile--lg relative z-10 ring-8 ring-surface " +
                  step.tile
                }
              >
                {step.icon}
              </span>

              <div className="mt-5">
                <span className="font-mono text-xs font-semibold tracking-widest text-muted-foreground">
                  STEP {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-2 font-display text-lg font-bold tracking-tight">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {step.desc}
                </p>
              </div>
            </motion.li>
          ))}
        </ol>
      </div>
    </div>
  </section>
);

export default HowItWorksSection;
