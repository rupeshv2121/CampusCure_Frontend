import { PlusOutlined } from "@ant-design/icons";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

const FAQS = [
  {
    question: "Who can use CampusCure?",
    answer:
      "Students, faculty members and administrators at an educational institution. Each role signs in to a different dashboard scoped to what that role is responsible for.",
  },
  {
    question: "How do I track my complaint status?",
    answer:
      "Every complaint you raise appears on your dashboard with its current status. You are notified when it is assigned, when it moves, and when it closes — you never have to ask anyone for an update.",
  },
  {
    question: "Is there a mobile app?",
    answer:
      "CampusCure is a responsive web application and works on phones, tablets and desktops today. A dedicated mobile app is planned but not yet released.",
  },
  {
    question: "How does the doubt community work?",
    answer:
      "Students post academic questions. Other students answer, and faculty can verify an answer as correct. Verified answers stay searchable, so the same question does not have to be asked again next term.",
  },
  {
    question: "What kinds of complaints can I submit?",
    answer:
      "Campus infrastructure issues — projectors, fans, lights, smart boards, seating and similar. Each is tagged to a block and classroom so it routes to the team that maintains it.",
  },
];

const EASE = [0.22, 1, 0.36, 1] as const;

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="cc-section">
      <div className="cc-container">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.55, ease: EASE }}
          className="cc-section-head"
        >
          <span className="cc-eyebrow">FAQ</span>
          <h2 className="cc-h2">
            Frequently asked <span className="cc-gradient-text">questions</span>
          </h2>
        </motion.div>

        <div className="mx-auto max-w-3xl space-y-3">
          {FAQS.map((faq, index) => {
            const open = openIndex === index;
            return (
              <motion.div
                key={faq.question}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.45, delay: index * 0.06, ease: EASE }}
                className={
                  "cc-card overflow-hidden transition-colors " +
                  (open ? "border-brand-500/40" : "")
                }
              >
                <h3>
                  <button
                    onClick={() => setOpenIndex(open ? null : index)}
                    aria-expanded={open}
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-accent/50 sm:px-6"
                  >
                    <span className="font-display text-[15px] font-semibold tracking-tight sm:text-base">
                      {faq.question}
                    </span>
                    <span
                      className={
                        "flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-[transform,background-color,color] duration-300 " +
                        (open
                          ? "rotate-45 bg-brand-600 text-white"
                          : "bg-accent text-brand-700")
                      }
                    >
                      {/* One icon rotated 45° instead of swapping plus for
                          minus — the transition reads as a single motion. */}
                      <PlusOutlined style={{ fontSize: 11 }} />
                    </span>
                  </button>
                </h3>

                <AnimatePresence initial={false}>
                  {open && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.28, ease: EASE }}
                      className="overflow-hidden"
                    >
                      <p className="border-t border-border px-5 py-4 text-sm leading-relaxed text-muted-foreground sm:px-6">
                        {faq.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
