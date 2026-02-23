/**
 * Central event registry for the plugin system.
 * Modules can subscribe to these events via the ModuleRegistry.
 */
export enum PluginModuleEvent {
    /** Dispatched when a module is fully initialized */
    MODULE_INIT = "MODULE_INIT",
    /** Dispatched when a message is created in a relevant channel */
    MESSAGE_CREATE = "MESSAGE_CREATE",
    /** Dispatched when a voice state change is detected */
    VOICE_STATE_UPDATE = "VOICE_STATE_UPDATE",
    /** Dispatched when an action is added to the ActionQueue */
    ACTION_QUEUED = "ACTION_QUEUED",
    /** Dispatched when an action is successfully executed from the ActionQueue */
    ACTION_EXECUTED = "ACTION_EXECUTED"
}

/**
 * Type definitions for event payloads to ensure type safety in subscribers.
 */
export interface EventPayloads {
    [PluginModuleEvent.MODULE_INIT]: { moduleName: string };
    [PluginModuleEvent.MESSAGE_CREATE]: { message: any };
    [PluginModuleEvent.VOICE_STATE_UPDATE]: { oldState: any; newState: any };
    [PluginModuleEvent.ACTION_QUEUED]: { item: any };
    [PluginModuleEvent.ACTION_EXECUTED]: { item: any };
}
