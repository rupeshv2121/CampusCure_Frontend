import { Fragment } from 'react';

type ResolutionVariant = 'success' | 'warning';

interface ResolutionNoteBlockProps {
  note: string;
  title?: string;
  variant?: ResolutionVariant;
}

interface ResolutionEntry {
  timestamp?: string;
  message: string;
}

const VARIANT_STYLES: Record<ResolutionVariant, { container: string; title: string; badge: string; text: string }> = {
  success: {
    container: 'rounded-xl border border-green-200 dark:border-green-700 bg-green-50 dark:bg-green-200/30 p-4',
    title: 'text-green-700 dark:text-green-800',
    badge: 'bg-green-100 text-green-700 dark:bg-green-300/30 dark:text-green-800',
    text: 'text-green-800 dark:text-green-700',
  },
  warning: {
    container: 'rounded-xl border border-yellow-200 dark:border-yellow-700 bg-yellow-50 dark:bg-yellow-300/20 p-4',
    title: 'text-yellow-700 dark:text-yellow-800',
    badge: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-300/30 dark:text-yellow-800',
    text: 'text-foreground',
  },
};

const parseResolutionEntries = (rawNote: string): ResolutionEntry[] => {
  const note = rawNote.replace(/\r\n/g, '\n').trim();
  if (!note) return [];

  const timestampChunks = note
    .split(/(?=\[[^\]]+\]\s*)/g)
    .map((chunk) => chunk.trim())
    .filter(Boolean);

  if (timestampChunks.length > 1 || /^\[[^\]]+\]/.test(note)) {
    return timestampChunks
      .map((chunk) => {
        const match = chunk.match(/^\[([^\]]+)\]\s*([\s\S]*)$/);
        if (!match) {
          return { message: chunk } as ResolutionEntry;
        }

        return {
          timestamp: match[1].trim(),
          message: match[2].trim(),
        };
      })
      .filter((entry) => entry.message.length > 0);
  }

  return note
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => ({ message: line }));
};

const ResolutionNoteBlock = ({
  note,
  title = 'Resolution Note',
  variant = 'success',
}: ResolutionNoteBlockProps) => {
  const styles = VARIANT_STYLES[variant];
  const entries = parseResolutionEntries(note);

  if (entries.length === 0) {
    return null;
  }

  return (
    <div className={styles.container}>
      <p className={`text-xs font-semibold uppercase tracking-wide mb-2 ${styles.title}`}>{title}</p>
      <div className="space-y-2">
        {entries.map((entry, index) => (
          <Fragment key={`${entry.timestamp ?? 'note'}-${index}`}>
            <div className="rounded-lg border border-black/5 bg-white/60 dark:bg-black/10 p-2.5">
              {entry.timestamp && (
                <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium mb-1 ${styles.badge}`}>
                  {entry.timestamp}
                </span>
              )}
              <p className={`text-sm leading-relaxed whitespace-pre-wrap ${styles.text}`}>{entry.message}</p>
            </div>
          </Fragment>
        ))}
      </div>
    </div>
  );
};

export default ResolutionNoteBlock;
