import {
  BookOutlined,
  CheckOutlined,
  DeploymentUnitOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { motion } from "framer-motion";

const BENEFITS = [
  {
    icon: <TeamOutlined />,
    title: "For students",
    tile: "",
    check: "bg-brand-600",
    items: [
      "Raise a complaint and follow it to resolution",
      "Get answers from peers, verified by faculty",
      "Keep a private shelf of saved doubts",
      "Build reputation for answers that helped",
    ],
  },
  {
    icon: <BookOutlined />,
    title: "For faculty",
    tile: "cc-icon-tile--violet",
    check: "bg-violet-600",
    items: [
      "Verify answers before they mislead a cohort",
      "See which topics a class keeps getting stuck on",
      "Handle complaints routed to your department",
      "Earn reputation alongside your students",
    ],
  },
  {
    icon: <DeploymentUnitOutlined />,
    title: "For administrators",
    tile: "cc-icon-tile--amber",
    check: "bg-amber-600",
    items: [
      "One queue for every complaint on campus",
      "Assign work and track who is accountable",
      "Spot the issues that keep coming back",
      "Report on resolution times with real numbers",
    ],
  },
];

const EASE = [0.22, 1, 0.36, 1] as const;

const BenefitsSection = () => (
  <section id="benefits" className="cc-section">
    <div className="cc-container">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.55, ease: EASE }}
        className="cc-section-head"
      >
        <span className="cc-eyebrow">Why choose us</span>
        <h2 className="cc-h2">
          Built for <span className="cc-gradient-text">every role</span> on
          campus
        </h2>
        <p className="cc-lede">
          The same records, three different jobs. Each role gets the view that
          matches what they are actually responsible for.
        </p>
      </motion.div>

      <div className="grid gap-5 md:grid-cols-3">
        {BENEFITS.map((b, i) => (
          <motion.article
            key={b.title}
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, delay: i * 0.1, ease: EASE }}
            className="cc-card cc-card--interactive group flex flex-col p-7 sm:p-8"
          >
            <span className={"cc-icon-tile cc-icon-tile--lg " + b.tile}>
              {b.icon}
            </span>

            <h3 className="mt-6 font-display text-xl font-bold tracking-tight">
              {b.title}
            </h3>

            <ul className="mt-5 space-y-3.5">
              {b.items.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span
                    className={
                      "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-white " +
                      b.check
                    }
                  >
                    <CheckOutlined style={{ fontSize: 9 }} />
                  </span>
                  <span className="text-sm leading-relaxed text-muted-foreground">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </motion.article>
        ))}
      </div>
    </div>
  </section>
);

export default BenefitsSection;
