import { UserStore } from "@webpack/common";

/**
 * Replaces placeholders like {username} and {id} in a string.
 */
export function formatString(template: string, replacements: Record<string, string> = {}): string {
    const user = UserStore.getCurrentUser();
    const base: Record<string, string> = {
        "{username}": user?.username || "unknown",
        "{id}": user?.id || "0",
        ...replacements
    };

    let result = template;
    for (const [key, value] of Object.entries(base)) {
        result = result.replace(new RegExp(key, "g"), value);
    }
    return result;
}
