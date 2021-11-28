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
    chainWebpack (fn) {
        this.service.webpackChainFns.push(fn)
    }
}

module.exports = PluginAPI
