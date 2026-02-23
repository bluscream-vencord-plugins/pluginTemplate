import { logger } from "../utils/logger";
import { PluginModule } from "../types/module";
import { PluginModuleEvent, EventPayloads } from "../types/events";
import { Message, Channel, User, Guild } from "@vencord/discord-types";
import { React } from "@webpack/common";

/**
 * Manages plugin modules and facilitates communication between them.
 */
export class ModuleRegistry {
    private modules: PluginModule[] = [];
    private _settings: Record<string, any> = {};
    private eventListeners: Map<PluginModuleEvent, Array<(payload: any) => void>> = new Map();

    public init(settings: Record<string, any>) {
        this._settings = settings;
        const sorted = this.resolveLoadOrder(this.modules);
        this.modules = sorted;

        for (const mod of this.modules) {
            try {
                mod.init(settings);
                this.dispatch(PluginModuleEvent.MODULE_INIT, { moduleName: mod.name });
            } catch (e) {
                logger.error(`Failed to initialize module ${mod.name}:`, e);
            }
        }
    }

    public register(module: PluginModule) {
        if (this.modules.some(m => m.name === module.name)) return;
        this.modules.push(module);
    }

    public stop() {
        for (const mod of this.modules) {
            try { mod.stop(); } catch (e) { }
        }
        this.eventListeners.clear();
        this.modules = [];
    }

    public get settings() { return this._settings; }

    public on<K extends keyof EventPayloads>(event: K, listener: (payload: EventPayloads[K]) => void) {
        const eventKey = event as unknown as PluginModuleEvent;
        if (!this.eventListeners.has(eventKey)) this.eventListeners.set(eventKey, []);
        this.eventListeners.get(eventKey)!.push(listener);
    }

    public dispatch<K extends keyof EventPayloads>(event: K, payload: EventPayloads[K]) {
        const eventKey = event as unknown as PluginModuleEvent;
        const listeners = this.eventListeners.get(eventKey);
        if (listeners) {
            for (const listener of listeners) listener(payload);
        }

        for (const mod of this.modules) {
            if (mod.onCustomEvent) mod.onCustomEvent(eventKey, payload);
        }
    }

    public dispatchMessageCreate(message: Message) {
        for (const mod of this.modules) {
            if (mod.onMessageCreate) mod.onMessageCreate(message);
        }
    }

    public dispatchVoiceStateUpdate(oldState: any, newState: any) {
        for (const mod of this.modules) {
            if (mod.onVoiceStateUpdate) mod.onVoiceStateUpdate(oldState, newState);
        }
    }

    public collectUserItems(user: User, channel?: Channel): React.ReactElement[] {
        return this.modules.flatMap(m => m.getUserMenuItems?.(user, channel) || []).filter(Boolean);
    }

    public collectChannelItems(channel: Channel): React.ReactElement[] {
        return this.modules.flatMap(m => m.getChannelMenuItems?.(channel) || []).filter(Boolean);
    }

    public collectGuildItems(guild: Guild): React.ReactElement[] {
        return this.modules.flatMap(m => m.getGuildMenuItems?.(guild) || []).filter(Boolean);
    }

    public collectToolboxItems(channel?: Channel): React.ReactElement[] {
        return this.modules.flatMap(m => m.getToolboxMenuItems?.(channel) || []).filter(Boolean);
    }

    private resolveLoadOrder(modules: PluginModule[]): PluginModule[] {
        const sorted: PluginModule[] = [];
        const visited = new Set<string>();
        const visiting = new Set<string>();
        const moduleMap = new Map(modules.map(m => [m.name, m]));

        const visit = (mod: PluginModule) => {
            if (visited.has(mod.name)) return;
            if (visiting.has(mod.name)) {
                logger.error(`Circular dependency: ${mod.name}`);
                return;
            }
            visiting.add(mod.name);

            const deps = [...(mod.requiredDependencies || []), ...(mod.optionalDependencies || [])];
            for (const depName of deps) {
                const dep = moduleMap.get(depName);
                if (dep) visit(dep);
            }

            visiting.delete(mod.name);
            visited.add(mod.name);
            sorted.push(mod);
        };

        for (const mod of modules) visit(mod);
        return sorted;
    }
}

export const moduleRegistry = new ModuleRegistry();
