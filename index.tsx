import definePlugin from "@utils/types";
import { pluginInfo } from "./info";
import { moduleRegistry } from "./core/moduleRegistry";
import { actionQueue } from "./core/actionQueue";
import { logger } from "./utils/logger";
import { ChannelStore } from "@webpack/common";
import { OptionType } from "@utils/types";
import { definePluginSettings } from "@api/Settings";

// Example of how we might aggregate settings in the future
export const defaultSettings = definePluginSettings({
    enableDebug: {
        type: OptionType.BOOLEAN,
        description: "Enable debug logging",
        default: false,
        restartNeeded: false
    }
});

export default definePlugin({
    ...pluginInfo,
    settings: defaultSettings,

    start() {
        logger.info(`${pluginInfo.name} starting...`);

        // Setup the action queue to log for now
        actionQueue.setExecutionHandler(async (data, contextId) => {
            logger.info(`Executing action in ${contextId}:`, data);
        });

        // Initialize modules with current settings
        moduleRegistry.init(this.settings.store as any);

        logger.info(`${pluginInfo.name} started.`);
    },

    stop() {
        logger.info(`${pluginInfo.name} stopping...`);
        moduleRegistry.stop();
        actionQueue.clear();
    },

    flux: {
        VOICE_STATE_UPDATES({ voiceStates }: { voiceStates: any[] }) {
            for (const state of voiceStates) {
                moduleRegistry.dispatchVoiceStateUpdate({ ...state, channelId: state.oldChannelId }, state);
            }
        },

        MESSAGE_CREATE({ message }: { message: any }) {
            moduleRegistry.dispatchMessageCreate(message);
        }
    },

    contextMenus: {
        UserProfileContextMenu(node, { user }) {
            return moduleRegistry.collectUserItems(user);
        },
        ChannelListContextMenu(node, { channel }) {
            return moduleRegistry.collectChannelItems(channel);
        },
        GuildContextMenu(node, { guild }) {
            return moduleRegistry.collectGuildItems(guild);
        }
    },

    toolboxActions() {
        const { SelectedChannelStore, ChannelStore: CS } = require("@webpack/common");
        const channelId = SelectedChannelStore.getVoiceChannelId() || SelectedChannelStore.getChannelId();
        const channel = channelId ? CS.getChannel(channelId) : undefined;

        const items = moduleRegistry.collectToolboxItems(channel);
        return items.length ? items : null;
    }
});
