class PluginAPI {
    constructor (id, service) {
        this.id = id
        this.service = service
    }
    registerCommand (name, opts, fn) {
        this.service.commands[name] = { fn, opts: opts || {}}
    }
    resolveWebpackConfig (chainableConfig) {
        return this.service.resolveWebpackConfig(chainableConfig)
    }
}

module.exports = PluginAPI
