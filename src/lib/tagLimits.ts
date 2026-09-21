/**
 * Tag limits, mirrored from the backend (CC-20).
 *
 * The server's copy in src/utils/tags.ts is authoritative and rejects anything
 * past these; this exists so the form can stop a student before a round trip.
 * Deliberately NOT the normalization rule itself — that lives on the server
 * only, and the normalized key travels with each doubt, so the same rule is
 * never implemented twice in two languages.
 */
export const MAX_TAGS_PER_DOUBT = 5;
export const MAX_TAG_LENGTH = 30;
