/**
 * Tag entry for the ask-a-doubt form (CC-20).
 *
 * Replaces a raw comma-separated text field. A free-text box with no
 * suggestions guarantees divergence — this offers what already exists, with
 * counts, so students reuse a tag instead of coining a near-duplicate.
 *
 * A student who types their own casing keeps it in the record, matches the
 * same filter bucket, and sees it rendered canonically like everyone else.
 */

import { Select } from "antd";
import { MAX_TAGS_PER_DOUBT } from "@/lib/tagLimits";
import { useTagVocabulary } from "@/hooks/useTagVocabulary";

interface Props {
  value: string[];
  onChange: (tags: string[]) => void;
  disabled?: boolean;
}

export const TagInput = ({ value, onChange, disabled }: Props) => {
  const { data: vocabulary = [], isLoading } = useTagVocabulary();

  return (
    <div className="space-y-1">
      <Select
        mode="tags"
        value={value}
        onChange={onChange}
        disabled={disabled}
        loading={isLoading}
        maxCount={MAX_TAGS_PER_DOUBT}
        placeholder="e.g. recursion, DBMS (optional)"
        className="w-full"
        // Suggestions are ranked by use, so the most established casing of a
        // tag is the one a student is most likely to pick.
        options={vocabulary.map((entry) => ({
          value: entry.display,
          label: `${entry.display} (${entry.count})`,
        }))}
        filterOption={(input, option) =>
          String(option?.value ?? "")
            .toLowerCase()
            .includes(input.trim().toLowerCase())
        }
      />
      <p className="text-xs text-muted-foreground">
        Up to {MAX_TAGS_PER_DOUBT} tags. Pick an existing one where you can — it
        is how other students will find your doubt.
      </p>
    </div>
  );
};

export default TagInput;
