import { NavigationRouter } from "@webpack/common";

/**
 * Transitions the Discord client to a specific path.
 */
export function navigateTo(path: string) {
    NavigationRouter.transitionTo(path);
}

/**
 * Transitions to a specific channel within a guild.
 */
export function navigateToChannel(guildId: string, channelId: string) {
    navigateTo(`/channels/${guildId}/${channelId}`);
}
