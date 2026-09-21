/**
 * The one place a tag is rendered (CC-20).
 *
 * Three roles, and they never swap:
 *
 *   stored    Doubt.labels             the author's own words, never shown
 *   matched   Doubt.labelsNormalized   the lookup key, never shown
 *   rendered  vocabulary display       canonical casing, what you see here
 *
 * Rendering `labels` directly would leave two cards side by side showing what
 * looks like two different tags — which defeats normalizing them in the first
 * place. A chip built anywhere else is the bug this component exists to stop.
 *
 * See campus_cure_backend/docs/specs/CC-20-tags.md.
 */

import { Tag } from "antd";
import { useTagDisplayMap } from "@/hooks/useTagVocabulary";
import { cn } from "@/lib/utils";

interface Props {
  /** The stored label, as the author typed it. */
  label: string;
  /**
   * The normalized key from the server, positionally aligned with `label`.
   *
   * Comes from the API rather than being computed here on purpose: deriving it
   * in the browser would put the same normalization rule in two languages, in
   * two repos that deploy independently, and the day they disagree chips stop
   * resolving. Falls back to the raw label for a legacy row.
   */
  tagKey?: string;
  onClick?: (tag: string) => void;
  active?: boolean;
  className?: string;
}

export const TagChip = ({
  label,
  tagKey,
  onClick,
  active = false,
  className,
}: Props) => {
  const vocabulary = useTagDisplayMap();
  const key = tagKey ?? label.trim().toLowerCase();

  // Raw label only while the vocabulary is still loading — it is what the
  // author typed, so it is never wrong, just possibly inconsistent.
  const display = vocabulary.get(key)?.display ?? label;

  if (!onClick) {
    return (
      <Tag color={active ? "blue" : undefined} className={cn("rounded-full text-xs", className)}>
        {display}
      </Tag>
    );
  }

  return (
    <button
      type="button"
      onClick={() => onClick(key)}
      aria-label={`Filter by ${display}`}
      className="cursor-pointer border-0 bg-transparent p-0"
    >
      <Tag
        color={active ? "blue" : undefined}
        className={cn(
          "rounded-full text-xs transition-opacity hover:opacity-80",
          className,
        )}
      >
        {display}
      </Tag>
    </button>
  );
};

/** A doubt's tags, rendered together. */
export const TagChipList = ({
  labels,
  labelsNormalized,
  onTagClick,
  activeTags = [],
}: {
  labels?: string[];
  labelsNormalized?: string[];
  onTagClick?: (tag: string) => void;
  activeTags?: string[];
}) => {
  if (!labels || labels.length === 0) return null;

  return (
    <>
      {labels.map((label, index) => {
        const key = labelsNormalized?.[index];
        return (
          <TagChip
            key={`${label}-${index}`}
            label={label}
            tagKey={key}
            onClick={onTagClick}
            active={key ? activeTags.includes(key) : false}
          />
        );
      })}
    </>
  );
};

export default TagChip;
