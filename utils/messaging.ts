import { ChannelStore, showToast, Toasts } from "@webpack/common";
import { logger } from "./logger";

/**
 * Sends an external message to a channel and shows a toast.
 */
export function sendExternalMessage(channelId: string, content: string) {
    const channel = ChannelStore.getChannel(channelId);
    const channelName = channel ? channel.name : channelId;
    showToast(`> ${channelName}: ${content.substring(0, 50)}`, Toasts.Type.MESSAGE);

    try {
        const { sendMessage } = require("@utils/discord");
        return sendMessage(channelId, { content }, true);
    } catch (e) {
        const { sendBotMessage } = require("@api/Commands");
        return sendBotMessage(channelId, { content });
    }
}

/**
 * Sends an ephemeral (local-only) bot message.
 */
export function sendEphemeralMessage(channelId: string, content: string, authorName?: string) {
    try {
        const { sendBotMessage } = require("@api/Commands");
        const { moduleRegistry } = require("../core/moduleRegistry");
        const settings = moduleRegistry.settings as any;

        return sendBotMessage(channelId, {
            content,
            author: {
                username: authorName || settings?.ephemeralAuthorName || "Plugin Bot"
            }
        });
    } catch (e) {
        showToast(content, Toasts.Type.MESSAGE);
    }
}
