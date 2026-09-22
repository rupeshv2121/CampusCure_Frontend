import {
  BarChartOutlined,
  BellOutlined,
  CustomerServiceOutlined,
  MessageOutlined,
  SafetyCertificateOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { motion } from "framer-motion";
import type { ReactNode } from "react";

type Feature = {
  icon: ReactNode;
  title: string;
  desc: string;
  /** Tonal variant of `.cc-icon-tile`; brand blue when omitted. */
  tile?: string;
  /** Bento span. The first two entries are wide, the rest are single cells. */
  wide?: boolean;
};

const FEATURES: Feature[] = [
  {
    icon: <MessageOutlined />,
    title: "Complaint management",
    desc: "Raise an issue, watch it route to the right desk, and follow every status change to resolution — no chasing anyone for an update.",
    wide: true,
  },
  {
    icon: <TeamOutlined />,
    title: "Doubt community",
    desc: "Students answer students, faculty verify what is correct, and the good answers stay searchable for the next cohort.",
    tile: "cc-icon-tile--violet",
    wide: true,
  },
  {
    icon: <BarChartOutlined />,
    title: "Analytics",
    desc: "Recurring issues, resolution times and engagement, charted for the people who decide budgets.",
    tile: "cc-icon-tile--amber",
  },
  {
    icon: <BellOutlined />,
    title: "Status updates",
    desc: "Notifications the moment a complaint moves or a doubt is answered.",
    tile: "cc-icon-tile--emerald",
  },
  {
    icon: <SafetyCertificateOutlined />,
    title: "Role-based access",
    desc: "Students, faculty, admins and super admins each see exactly their own scope.",
  },
  {
    icon: <CustomerServiceOutlined />,
    title: "Help & support",
    desc: "An in-app assistant for students, plus documentation for the people running it.",
    tile: "cc-icon-tile--rose",
  },
];

const EASE = [0.22, 1, 0.36, 1] as const;

const FeaturesSection = () => (
  <section id="features" className="cc-section">
    <div className="cc-container">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.55, ease: EASE }}
        className="cc-section-head"
      >
        <span className="cc-eyebrow">Features</span>
        <h2 className="cc-h2">
          Everything your campus needs,{" "}
          <span className="cc-gradient-text">in one place</span>
        </h2>
        <p className="cc-lede">
          Two things break down on every campus: issues nobody owns, and
          questions nobody answers. CampusCure gives both a home, and a paper
          trail.
        </p>
      </motion.div>

      {/* Bento layout: the two headline capabilities get double-width cells on
          large screens, the supporting four sit underneath at equal weight. */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURES.map((f, i) => (
          <motion.article
            key={f.title}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, delay: Math.min(i, 4) * 0.07, ease: EASE }}
            className={
              "cc-card cc-card--interactive cc-card--accent group p-6 sm:p-7 " +
              (f.wide ? "lg:col-span-2" : "")
            }
          >
            <span className={"cc-icon-tile " + (f.tile ?? "")}>{f.icon}</span>

            <h3 className="mt-5 font-display text-lg font-bold tracking-tight">
              {f.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {f.desc}
            </p>
          </motion.article>
        ))}
      </div>
    </div>
  </section>
);

export default FeaturesSection;
