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
        const fmtFunc = conf => {
            if (typeof conf === 'function') {
                return conf.toString().replace(/\r\n?/g, '\n')
            }
            return conf
        }
        const cacheDirectory = this.resolve(`node_modules/.cache/${id}`)
        const variables = {
            partialIdentifier,
            'cli-service': require('../package.json').version,
            'cache-loader': require('cache-loader/package.json').version,
            env: process.env.NODE_ENV,
            test: !!process.env.VUE_CLI_TEST,
            config: [
                fmtFunc(this.service.projectOptions.chainWebpack),
                fmtFunc(this.service.projectOptions.configureWebpack)
            ]
        }
        console.log('gsdvariables', variables)
        const cacheIdentifier = hash(variables)
        return { cacheDirectory, cacheIdentifier }
    }
}

module.exports = PluginAPI
