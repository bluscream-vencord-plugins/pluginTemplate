import { logger } from "../utils/logger";
import { sendDebugMessage } from "../utils/debug";

/**
 * Represents an item in the execution queue.
 */
export interface ActionQueueItem {
    id: string;
    /** The actual payload or command to execute */
    data: any;
    /** The target channel or context ID */
    contextId: string;
    /** Timestamp when it was enqueued */
    timestamp: number;
    /** Optional check performed immediately before execution */
    executeCondition?: () => boolean;
}

/**
 * A robust, sequential execution queue designed for rate-limited external actions.
 */
export class ActionQueue {
    private queue: ActionQueueItem[] = [];
    private isProcessing: boolean = false;
    private delayMs: number = 2000;

    /** Callback responsible for the actual "sending" of the action */
    private executionHandler: ((data: any, contextId: string) => Promise<any>) | null = null;

    public setDelay(ms: number) {
        this.delayMs = ms;
    }

    public setExecutionHandler(handler: (data: any, contextId: string) => Promise<any>) {
        this.executionHandler = handler;
    }

    /**
     * Enqueues a new action for sequential processing.
     */
    public enqueue(data: any, contextId: string, executeCondition?: () => boolean) {
        const item: ActionQueueItem = {
            id: Math.random().toString(36).substring(7),
            data,
            contextId,
            timestamp: Date.now(),
            executeCondition
        };

        this.queue.push(item);
        sendDebugMessage(`Enqueued action: \`${String(data).substring(0, 50)}\``, contextId);

        this.processQueue();
    }

    public clear() {
        this.queue = [];
    }

    private async processQueue() {
        if (this.isProcessing || this.queue.length === 0) return;

        this.isProcessing = true;
        const item = this.queue.shift();

        const finalize = () => {
            setTimeout(() => {
                this.isProcessing = false;
                this.processQueue();
            }, this.delayMs);
        };

        if (!item) {
            this.isProcessing = false;
            return;
        }

        if (item.executeCondition && !item.executeCondition()) {
            sendDebugMessage(`Pre-flight failed for action. Skipping.`, item.contextId);
            finalize();
            return;
        }

        if (!this.executionHandler) {
            logger.error("ActionQueue: No execution handler set!");
            finalize();
            return;
        }

        try {
            logger.info(`ActionQueue: Executing action in ${item.contextId}`);
            await this.executionHandler(item.data, item.contextId);
            finalize();
        } catch (e) {
            logger.error("ActionQueue: Execution failed:", e);
            finalize();
        }
    }
}

export const actionQueue = new ActionQueue();
