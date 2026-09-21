/**
 * Reputation, history and the leaderboard (CC-25).
 *
 * See campus_cure_backend/docs/specs/CC-25-reputation.md.
 */

import { useQuery } from "@tanstack/react-query";
import { Card, Empty, Progress, Spin, Table, Tabs, Tag, Tooltip } from "antd";
import { motion } from "framer-motion";
import { Award, Info, TrendingUp } from "lucide-react";
import {
  REASON_LABELS,
  getLeaderboard,
  getReputationHistory,
  getReputationSummary,
  type LeaderboardEntry,
  type ReputationEvent,
} from "@/api/reputation";
import { RankBadge } from "@/components/reputation/RankBadge";
import { useAuth } from "@/context/AuthContext";

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

/** Score, rank, and how far the next one is. */
const SummaryCard = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["reputation-summary"],
    queryFn: getReputationSummary,
  });

  if (isLoading) {
    return (
      <Card className="rounded-2xl">
        <div className="flex justify-center py-8">
          <Spin />
        </div>
      </Card>
    );
  }

  if (!data) return null;

  // Progress through the CURRENT rank, not toward the cap: the gap between
  // ranks is what the reader is trying to close.
  const span = data.next ? data.next.needed + data.reputation : data.reputation;
  const percent = data.next
    ? Math.min(100, Math.round((data.reputation / Math.max(1, span)) * 100))
    : 100;

  const cappedOut = data.earnedToday >= data.dailyCap;

  return (
    <Card className="rounded-2xl">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Your reputation</p>
          <div className="mt-1 flex items-center gap-3">
            <span className="text-3xl font-bold text-foreground">
              {data.reputation}
            </span>
            <RankBadge rank={data.rank} />
          </div>
        </div>

        <Award className="h-8 w-8 text-amber-500" />
      </div>

      {data.next ? (
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{data.rank}</span>
            <span>
              {data.next.needed} more to {data.next.name}
            </span>
          </div>
          <Progress percent={percent} showInfo={false} strokeColor="#1677ff" />
        </div>
      ) : (
        <p className="mt-4 text-sm text-muted-foreground">
          You are at the highest rank.
        </p>
      )}

      <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
        <span>
          Earned today: {data.earnedToday} of {data.dailyCap}
        </span>
        <Tooltip
          title="The cap limits points earned per day, not votes. An upvote past the cap still counts on the answer — it just stops paying."
        >
          <Info className="h-3.5 w-3.5 cursor-help" />
        </Tooltip>
        {cappedOut && <Tag color="orange">Daily cap reached</Tag>}
      </div>
    </Card>
  );
};

/** The ledger — why the score is what it is. */
const HistoryTab = () => {
  const { data = [], isLoading } = useQuery({
    queryKey: ["reputation-history"],
    queryFn: () => getReputationHistory(50),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <Spin />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <Empty
        image={<TrendingUp className="mx-auto h-9 w-9 text-muted-foreground" />}
        description={
          <div className="space-y-1">
            <p className="text-base font-medium text-foreground">
              Nothing earned yet
            </p>
            <p className="text-sm text-muted-foreground">
              Answer someone&apos;s doubt — an upvote is worth 10 points and an
              accepted answer 15.
            </p>
          </div>
        }
      />
    );
  }

  return (
    <div className="space-y-2">
      {data.map((event: ReputationEvent) => (
        <div
          key={event.id}
          className="flex items-center justify-between rounded-xl border p-3"
        >
          <div className="min-w-0">
            <p className="truncate text-sm text-foreground">
              {REASON_LABELS[event.reason] ?? event.reason}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatDate(event.createdAt)}
            </p>
          </div>
          <span
            className={
              event.delta >= 0
                ? "font-semibold text-emerald-600"
                : "font-semibold text-red-600"
            }
          >
            {event.delta >= 0 ? `+${event.delta}` : event.delta}
          </span>
        </div>
      ))}
    </div>
  );
};

const LeaderboardTab = () => {
  const { user } = useAuth();
  const { data = [], isLoading } = useQuery({
    queryKey: ["reputation-leaderboard"],
    queryFn: () => getLeaderboard(20),
  });

  const columns = [
    {
      title: "#",
      dataIndex: "position",
      width: 60,
      render: (position: number) => (
        <span className="font-semibold text-muted-foreground">{position}</span>
      ),
    },
    {
      title: "Member",
      dataIndex: "name",
      render: (_: unknown, row: LeaderboardEntry) => (
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-foreground">
            {row.name || row.userID}
            {row.id === user?.id && (
              <Tag className="ml-2 rounded-full" color="blue">
                You
              </Tag>
            )}
          </p>
          {row.studentProfile && (
            <p className="text-xs text-muted-foreground">
              {row.studentProfile.branch} · Sem {row.studentProfile.semester}
            </p>
          )}
        </div>
      ),
    },
    {
      title: "Rank",
      dataIndex: "rank",
      render: (rank: string) => <RankBadge rank={rank} />,
    },
    {
      title: "Points",
      dataIndex: "reputation",
      align: "right" as const,
      render: (reputation: number) => (
        <span className="font-semibold">{reputation}</span>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <Spin />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <Empty description="Nobody has earned reputation yet. Be the first to answer a doubt." />
    );
  }

  return (
    <Table
      rowKey="id"
      dataSource={data}
      columns={columns}
      pagination={false}
      size="middle"
    />
  );
};

export const ReputationPage = () => (
  <div className="p-4 md:p-6 space-y-4">
    <div>
      <h1 className="text-xl font-semibold text-foreground">Reputation</h1>
      <p className="mt-0.5 text-sm text-muted-foreground">
        Earned by helping other students. Answering is worth about five times
        asking.
      </p>
    </div>

    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <SummaryCard />
    </motion.div>

    <Card className="rounded-2xl">
      <Tabs
        items={[
          { key: "history", label: "How you earned it", children: <HistoryTab /> },
          { key: "leaderboard", label: "Leaderboard", children: <LeaderboardTab /> },
        ]}
      />
    </Card>
  </div>
);

export default ReputationPage;
