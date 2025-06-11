/**
 * Plugin System Types and Interfaces
 */
// Plugin Error Types
export class PluginError extends Error {
    pluginName;
    code;
    cause;
    constructor(message, pluginName, code, cause) {
        super(message);
        this.pluginName = pluginName;
        this.code = code;
        this.cause = cause;
        this.name = 'PluginError';
    }
}
export class PluginLoadError extends PluginError {
    constructor(pluginName, cause) {
        super(`Failed to load plugin: ${pluginName}`, pluginName, 'LOAD_ERROR', cause);
        this.name = 'PluginLoadError';
    }
}
export class PluginConfigError extends PluginError {
    constructor(pluginName, message) {
        super(`Plugin configuration error: ${message}`, pluginName, 'CONFIG_ERROR');
        this.name = 'PluginConfigError';
    }
}
export class PluginRuntimeError extends PluginError {
    constructor(pluginName, operation, cause) {
        super(`Plugin runtime error during ${operation}`, pluginName, 'RUNTIME_ERROR', cause);
        this.name = 'PluginRuntimeError';
    }
}
