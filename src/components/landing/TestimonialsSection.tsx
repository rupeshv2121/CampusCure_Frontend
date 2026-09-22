import { StarFilled } from "@ant-design/icons";
import { motion } from "framer-motion";

const TESTIMONIALS = [
  {
    name: "Ankit Sharma",
    role: "B.Tech CSE, 3rd year",
    quote:
      "I reported the broken projector in our lab on a Monday and it was fixed by Wednesday. I never had to ask anyone where it had got to.",
    initials: "AS",
    tile: "",
    rating: 5,
  },
  {
    name: "Dr. Priya Mehta",
    role: "Associate Professor, CS",
    quote:
      "The doubt community changed how students ask for help. I can verify an answer, and the whole class benefits instead of one student in my office hours.",
    initials: "PM",
    tile: "cc-icon-tile--violet",
    rating: 5,
  },
  {
    name: "Rahul Verma",
    role: "B.Tech ECE, 2nd year",
    quote:
      "Real-time tracking is the part I actually use. I always know the status without chasing anybody down a corridor.",
    initials: "RV",
    tile: "cc-icon-tile--emerald",
    rating: 4,
  },
  {
    name: "Prof. Suresh Iyer",
    role: "Head of Department, ME",
    quote:
      "The dashboard shows us which issues keep recurring. We cut our average resolution time by roughly 40% in two terms.",
    initials: "SI",
    tile: "cc-icon-tile--amber",
    rating: 5,
  },
  {
    name: "Sneha Patel",
    role: "M.Tech IT, 1st year",
    quote:
      "During exam season the community is a lifesaver. Peer answers with faculty verification is the combination that makes it trustworthy.",
    initials: "SP",
    tile: "cc-icon-tile--rose",
    rating: 5,
  },
  {
    name: "Rajesh Kumar",
    role: "Campus administrator",
    quote:
      "Hundreds of complaints across departments used to live in email. Now there is one queue, and assignment actually sticks.",
    initials: "RK",
    tile: "",
    rating: 4,
  },
];

const EASE = [0.22, 1, 0.36, 1] as const;

const Stars = ({ rating }: { rating: number }) => (
  <div
    className="flex shrink-0 gap-0.5"
    aria-label={`Rated ${rating} out of 5`}
  >
    {Array.from({ length: 5 }).map((_, i) => (
      <StarFilled
        key={i}
        style={{ fontSize: 11 }}
        className={i < rating ? "text-amber-500" : "text-border"}
      />
    ))}
  </div>
);

const TestimonialsSection = () => (
  <section id="testimonials" className="cc-section cc-section--muted">
    <div className="cc-container">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.55, ease: EASE }}
        className="cc-section-head"
      >
        <span className="cc-eyebrow">Testimonials</span>
        <h2 className="cc-h2">
          Loved by the <span className="cc-gradient-text">campus community</span>
        </h2>
        <p className="cc-lede">
          What students, faculty and administrators say after living with it for
          a term.
        </p>
      </motion.div>

      {/* Masonry-ish columns: quotes vary in length, and equal-height grid
          cells would leave a ragged band of whitespace under the short ones. */}
      <div className="columns-1 gap-5 sm:columns-2 lg:columns-3">
        {TESTIMONIALS.map((t, i) => (
          <motion.figure
            key={t.name}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: (i % 3) * 0.08, ease: EASE }}
            className="cc-card cc-card--interactive mb-5 break-inside-avoid p-6"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 32 32"
              className="h-7 w-7 fill-brand-500/20"
            >
              <path d="M13 22c0 3.3-2.7 6-6 6H6v-4h1c1.1 0 2-.9 2-2v-1H4V8h9v14Zm15 0c0 3.3-2.7 6-6 6h-1v-4h1c1.1 0 2-.9 2-2v-1h-5V8h9v14Z" />
            </svg>

            <blockquote className="mt-3 text-[15px] leading-relaxed text-foreground">
              {t.quote}
            </blockquote>

            <figcaption className="mt-5 flex items-center gap-3 border-t border-border pt-4">
              <span
                className={
                  "cc-icon-tile cc-icon-tile--sm text-xs font-bold " + t.tile
                }
              >
                {t.initials}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold">
                  {t.name}
                </span>
                <span className="block truncate text-xs text-muted-foreground">
                  {t.role}
                </span>
              </span>
              <Stars rating={t.rating} />
            </figcaption>
          </motion.figure>
        ))}
      </div>
    </div>
  </section>
);

export default TestimonialsSection;
