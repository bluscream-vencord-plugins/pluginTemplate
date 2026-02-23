/**
 * Supported core event types.
 */
export enum CoreEvent {
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
 * Custom events can be defined here or used as generic strings.
 */
export interface EventPayloads {
    [CoreEvent.MODULE_INIT]: { moduleName: string };
    [CoreEvent.MESSAGE_CREATE]: { message: any };
    [CoreEvent.VOICE_STATE_UPDATE]: { oldState: any; newState: any };
    [CoreEvent.ACTION_QUEUED]: { item: any };
    [CoreEvent.ACTION_EXECUTED]: { item: any };
    // Fallback for custom string events
    [key: string]: any;
}
