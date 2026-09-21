/**
 * The doubts a student has saved for later (CC-21).
 *
 * Ordered by when they saved it, not when it was posted, so the page reads as
 * "what I put here" rather than as another feed.
 */

import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Empty, Spin, Tag } from "antd";
import { EyeOutlined, MessageOutlined } from "@ant-design/icons";
import { Bookmark } from "lucide-react";
import { getBookmarkedDoubts } from "@/api/student";
import { BookmarkButton } from "@/components/bookmarks/BookmarkButton";
import { TagChipList } from "@/components/tags/TagChip";
import { stripCodeBlocks } from "@/lib/codeBlocks";
import type { Doubt } from "@/types";

const statusColors: Record<string, string> = {
  OPEN: "orange",
  ANSWERED: "blue",
  RESOLVED: "green",
};

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

export const SavedDoubts = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: doubts = [], isLoading } = useQuery({
    queryKey: ["bookmarked-doubts"],
    queryFn: getBookmarkedDoubts,
  });

  /**
   * Unsaving from this page should remove the card, not leave an unfilled
   * bookmark sitting in a list of saved things.
   */
  const handleChange = (doubtId: string, bookmarked: boolean) => {
    if (bookmarked) return;
    queryClient.setQueryData<Doubt[]>(["bookmarked-doubts"], (current) =>
      (current ?? []).filter((doubt) => doubt.id !== doubtId),
    );
  };

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Saved doubts</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Only you can see this list.
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spin />
        </div>
      ) : doubts.length === 0 ? (
        <div className="py-16">
          <Empty
            image={
              <Bookmark className="mx-auto h-10 w-10 text-muted-foreground" />
            }
            description={
              <div className="space-y-1">
                <p className="text-base font-medium text-foreground">
                  Nothing saved yet
                </p>
                <p className="text-sm text-muted-foreground">
                  Tap the bookmark on any doubt to keep it here — useful for the
                  good explanation you will want again before an exam.
                </p>
              </div>
            }
          />
        </div>
      ) : (
        <div className="space-y-3">
          {doubts.map((doubt, index) => (
            <motion.div
              key={doubt.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => navigate(`/student/doubts/${doubt.id}`)}
              className="bg-card rounded-2xl border p-5 cursor-pointer transition hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground text-base">
                    {doubt.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {stripCodeBlocks(doubt.description)}
                  </p>
                  <div className="flex gap-1.5 mt-2 flex-wrap">
                    <Tag color="purple">{doubt.subject}</Tag>
                    <Tag>Sem {doubt.semester}</Tag>
                    <TagChipList
                      labels={doubt.labels}
                      labelsNormalized={doubt.labelsNormalized}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Tag color={statusColors[doubt.status]}>{doubt.status}</Tag>
                  <BookmarkButton
                    doubtId={doubt.id}
                    bookmarked
                    onChange={(next) => handleChange(doubt.id, next)}
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MessageOutlined /> {doubt.answerCount} answers
                </span>
                <span className="flex items-center gap-1">
                  <EyeOutlined /> {doubt.views} views
                </span>
                <span>by {doubt.postedBy.name || doubt.postedBy.userID}</span>
                {doubt.savedAt && <span>saved {formatDate(doubt.savedAt)}</span>}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedDoubts;
