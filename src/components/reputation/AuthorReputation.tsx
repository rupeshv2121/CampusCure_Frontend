/**
 * Reputation shown beside a post's author (CC-25).
 *
 * This is where a reputation system earns its keep - a reader weighing two
 * answers, not a leaderboard they have to go and open.
 *
 * Silent at zero: a "0" next to a newcomer's first answer discourages exactly
 * the person the community most needs to keep.
 */

import { Tooltip } from "antd";
import { Award } from "lucide-react";

export const AuthorReputation = ({
  reputation,
}: {
  reputation?: number | undefined;
}) => {
  if (!reputation || reputation <= 0) return null;

  return (
    <Tooltip title={`${reputation} reputation earned by helping other students`}>
      <span className="ml-2 inline-flex items-center gap-0.5 align-middle text-xs text-amber-600 dark:text-amber-500">
        <Award className="h-3 w-3" />
        {reputation}
      </span>
    </Tooltip>
  );
};

export default AuthorReputation;
