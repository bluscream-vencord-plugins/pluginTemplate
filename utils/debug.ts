import { logger } from "./logger";
import { sendBotMessage } from "@api/Commands";
import { pluginInfo } from "../info";
import { moduleRegistry } from "../core/moduleRegistry";

/**
 * Sends a debug message to the specified channel if debug mode is enabled.
 */
export function sendDebugMessage(content: string, channelId?: string) {
    const settings = moduleRegistry.settings as any;
    if (!settings || !settings.enableDebug) {
        logger.debug(content);
        return;
    }

    if (!channelId) {
        logger.warn("sendDebugMessage: No channelId provided for debug message:", content);
        return;
    }

    try {
        sendBotMessage(channelId, {
            content: `[DEBUG] ${content}`,
            author: {
                username: `${pluginInfo.name} Debug`,
                avatar_url: "https://cdn.discordapp.com/avatars/913852862990262282/6cef25d3cdfad395b26e32260da0b320.webp?size=1024"
            }
        });
    } catch (e) {
        logger.error("Failed to send debug message:", e);
    }
}
