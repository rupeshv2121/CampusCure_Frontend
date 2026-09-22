/**
 * Save a doubt for later (CC-21).
 *
 * Private: no count is shown, because displaying one would turn a private
 * action public and change what people save. That is also why this is not
 * simply an upvote — upvote is a public quality judgement, and reusing it as
 * "save for later" corrupts a number CC-25 is going to read.
 *
 * See campus_cure_backend/docs/specs/CC-21-bookmarks.md.
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Bookmark } from "lucide-react";
import { toast } from "sonner";
import { setDoubtBookmark } from "@/api/student";
import { cn } from "@/lib/utils";

interface Props {
  doubtId: string;
  bookmarked: boolean;
  /** Applied immediately; the parent does not need to re-fetch to show it. */
  onChange?: (bookmarked: boolean) => void;
  showLabel?: boolean;
  className?: string;
}

export const BookmarkButton = ({
  doubtId,
  bookmarked,
  onChange,
  showLabel = false,
  className,
}: Props) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (next: boolean) => setDoubtBookmark(doubtId, next),
    // Optimistic: the button never waits for the network. This is the whole
    // reason both endpoints are idempotent — a double-tap on campus wifi
    // resolves to the same state either way.
    onMutate: (next: boolean) => {
      onChange?.(next);
      return { previous: !next };
    },
    onError: (error, _next, context) => {
      if (context) onChange?.(context.previous);
      toast.error(
        error instanceof Error ? error.message : "Could not update your saved list",
      );
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ["bookmarked-doubts"] });
    },
  });

  return (
    <button
      type="button"
      onClick={(event) => {
        // Cards are clickable; saving one must not also open it.
        event.stopPropagation();
        mutation.mutate(!bookmarked);
      }}
      aria-pressed={bookmarked}
      aria-label={bookmarked ? "Remove from saved" : "Save for later"}
      title={bookmarked ? "Remove from saved" : "Save for later"}
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs transition-colors",
        bookmarked
          ? "text-blue-600 dark:text-blue-400"
          : "text-muted-foreground hover:text-foreground",
        className,
      )}
    >
      <Bookmark className={cn("h-4 w-4", bookmarked && "fill-current")} />
      {showLabel && (bookmarked ? "Saved" : "Save")}
    </button>
  );
};

export default BookmarkButton;
