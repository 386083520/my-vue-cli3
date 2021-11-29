const path = require('path')
const hash = require('hash-sum')
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
    resolve (_path) {
        return path.resolve(this.service.context, _path)
    }

    genCacheConfig (id, partialIdentifier, configFiles = []) {
        const cacheDirectory = this.resolve(`node_modules/.cache/${id}`)
        const variables = {

        }
        const cacheIdentifier = hash(variables)
        return { cacheDirectory, cacheIdentifier }
    }
}

module.exports = PluginAPI
