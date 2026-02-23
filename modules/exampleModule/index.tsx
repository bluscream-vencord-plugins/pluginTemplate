import { PluginModule } from "../../types/module";
import { actionQueue } from "../../core/actionQueue";
import { logger } from "../../utils/logger";
import { React, Menu, showToast } from "@webpack/common";
import { OptionType } from "@utils/types";

export const ExampleModule: PluginModule = {
    name: "ExampleModule",
    description: "A demonstration module showing how to use the template system.",
    settings: null,

    settingsSchema: {
        exampleToggle: {
            type: OptionType.BOOLEAN,
            description: "An example toggle for this module",
            default: true
        }
    },

    init(settings) {
        this.settings = settings;
        logger.info("[ExampleModule] Initialized with settings:", settings);

        // Example of enqueueing an action on startup
        actionQueue.enqueue("Hello from ExampleModule!", "global");

        // Example: Emit a custom event after 5 seconds
        setTimeout(() => {
            const { moduleRegistry } = require("../../core/moduleRegistry");
            moduleRegistry.dispatch("EXAMPLE_CUSTOM_EVENT", { foo: "bar", timestamp: Date.now() });
        }, 5000);
    },

    stop() {
        logger.info("[ExampleModule] Stopped.");
    },

    onMessageCreate(message) {
        if (this.settings?.exampleToggle && message.content === "!ping") {
            actionQueue.enqueue("Pong!", message.channel_id);
        }
    },

    onCustomEvent(event, payload) {
        if (event === "EXAMPLE_CUSTOM_EVENT") {
            logger.info("[ExampleModule] Received custom event!", payload);
            showToast(`Custom Event: ${payload.foo}`);
        }
    },

    getUserMenuItems(user) {
        return [
            <Menu.MenuItem
                id="example-user-action"
                label={`Hello ${user.username}`}
                action={() => showToast(`Clicked on ${user.username}!`)}
            />
        ];
    },

    getToolboxMenuItems(channel) {
        return [
            <Menu.MenuItem
                id="example-toolbox-action"
                label="Example Toolbox Item"
                action={() => showToast("Toolbox item clicked!")}
            />
        ];
    }
};
