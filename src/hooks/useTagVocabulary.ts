/**
 * The tag vocabulary (CC-20).
 *
 * Lives apart from TagChip.tsx so that file exports only components — a
 * mixed-export module breaks Fast Refresh, which the lint rule catches.
 */

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getDoubtTags, type TagVocabularyEntry } from "@/api/student";

/**
 * Shared through the query cache, so a page of cards fetches it once however
 * many chips ask for it.
 */
export const useTagVocabulary = () =>
  useQuery({
    queryKey: ["doubt-tags"],
    queryFn: getDoubtTags,
    staleTime: 5 * 60 * 1000,
  });

/** Normalized key -> entry, for resolving a chip's canonical display casing. */
export const useTagDisplayMap = (): Map<string, TagVocabularyEntry> => {
  const { data } = useTagVocabulary();

  // Memoised: without this every chip rebuilds the whole map on every render.
  return useMemo(
    () => new Map((data ?? []).map((entry) => [entry.tag, entry])),
    [data],
  );
};
