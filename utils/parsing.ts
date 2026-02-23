/**
 * Extracts a Discord ID from a mention or raw string.
 */
export function extractId(mention: string): string {
    return mention.replace(/[<@!&>]/g, "");
}

/**
 * Parses a string into a boolean.
 */
export function parseBoolean(value: string): boolean {
    const lower = value.toLowerCase();
    return lower === "true" || lower === "yes" || lower === "1";
}
