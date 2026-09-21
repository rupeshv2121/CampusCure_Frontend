/**
 * Rank badge (CC-25).
 *
 * The rank is DERIVED from the score on the server and arrives with it, so
 * this never recomputes a threshold — a second copy of the thresholds in the
 * browser is a second thing to keep in sync with the first.
 */

import { Tag } from "antd";
import { cn } from "@/lib/utils";

/**
 * Colour per rank, ordered the way the server orders them.
 *
 * Deliberately not a gradient of one hue: the point is that the ranks are
 * distinguishable at a glance, not that they look like a progress bar.
 */
const RANK_COLOR: Record<string, string> = {
  Newcomer: "default",
  Contributor: "blue",
  Helper: "cyan",
  Mentor: "purple",
  Expert: "gold",
};

export const RankBadge = ({
  rank,
  reputation,
  className,
}: {
  rank: string;
  /** Omit to show the rank alone. */
  reputation?: number;
  className?: string;
}) => (
  <Tag color={RANK_COLOR[rank] ?? "default"} className={cn("rounded-full", className)}>
    {rank}
    {typeof reputation === "number" && (
      <span className="ml-1 font-semibold">{reputation}</span>
    )}
  </Tag>
);

export default RankBadge;
