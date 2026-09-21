/**
 * Render attachments on an entity that already has them (CC-02).
 *
 * Download URLs are signed and expire in minutes, so they are fetched when a
 * thumbnail actually renders rather than cached with the parent record. A URL
 * stored alongside the complaint list would be dead before anyone clicked it.
 */

import { useEffect, useState } from "react";
import { FileText, ImageOff } from "lucide-react";
import { type AttachmentSummary, getDownloadUrl } from "@/api/uploads";

/**
 * Resolves one attachment to a live URL.
 *
 * Each thumbnail signs its own URL. That is one request per file, which is
 * acceptable at five files per complaint and avoids the alternative — minting
 * URLs for every attachment in a list most of which are never looked at.
 */
const AttachmentThumb = ({ attachment }: { attachment: AttachmentSummary }) => {
  const [url, setUrl] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    getDownloadUrl(attachment.id)
      .then((target) => {
        if (!cancelled) setUrl(target.url);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });

    // The component can unmount while the request is in flight — on a list
    // that re-renders as complaints load, that is the common case.
    return () => {
      cancelled = true;
    };
  }, [attachment.id]);

  const isImage = attachment.mimeType.startsWith("image/");

  if (failed) {
    return (
      <div
        className="flex h-20 w-20 items-center justify-center rounded border text-muted-foreground"
        title="This file could not be loaded"
      >
        <ImageOff className="h-5 w-5" />
      </div>
    );
  }

  if (!url) {
    return <div className="h-20 w-20 animate-pulse rounded border bg-muted" />;
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      title={attachment.originalName}
      className="block h-20 w-20 overflow-hidden rounded border hover:opacity-80"
    >
      {isImage ? (
        <img
          src={url}
          alt={attachment.originalName}
          className="h-full w-full object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <span className="flex h-full w-full flex-col items-center justify-center gap-1 p-1 text-center">
          <FileText className="h-5 w-5 text-muted-foreground" />
          <span className="w-full truncate text-[10px] text-muted-foreground">
            {attachment.originalName}
          </span>
        </span>
      )}
    </a>
  );
};

export const AttachmentList = ({
  attachments,
  label = "Attachments",
  className,
}: {
  attachments?: AttachmentSummary[];
  label?: string;
  className?: string;
}) => {
  if (!attachments || attachments.length === 0) return null;

  return (
    <div className={`space-y-2 ${className ?? ""}`}>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <div className="flex flex-wrap gap-2">
        {attachments.map((attachment) => (
          <AttachmentThumb key={attachment.id} attachment={attachment} />
        ))}
      </div>
    </div>
  );
};

export default AttachmentList;
