const fs = require('fs')
const path = require('path')
const readPkg = require('read-pkg')
const { isPlugin, error, warn } = require('@vue/cli-shared-utils')
const debug = require('debug')
const dotenv = require('dotenv')
const chalk = require('chalk')
const dotenvExpand = require('dotenv-expand')
const defaultsDeep = require('lodash.defaultsdeep')
const Config = require('webpack-chain')

const { validate, defaults } = require('./options')
const PluginAPI = require('./PluginAPI')

function ensureSlash (config, key) {
    let val = config[key]
    if (typeof val === 'string') {
        if (!/^https?:/.test(val)) {
            val = val.replace(/^([^/.])/, '/$1')
        }
        config[key] = val.replace(/([^/])$/, '$1/')
        console.log('gsdconfig', config)
    }
}

function removeSlash (config, key) {
    if (typeof config[key] === 'string') {
        config[key] = config[key].replace(/\/$/g, '')
    }
}


module.exports = class Service {
    constructor (context, { plugins, pkg, inlineOptions, useBuiltIn } = {}) {
        this.context = context
        this.initialized = false
        this.commands = {}
        this.inlineOptions = inlineOptions
        this.webpackChainFns = []
        this.pkg = this.resolvePkg(pkg)
        this.plugins = this.resolvePlugins(plugins, useBuiltIn)
        this.pluginsToSkip = new Set()
        this.modes = this.plugins.reduce((modes, { apply: { defaultModes }}) => {
            return Object.assign(modes, defaultModes)
        }, {})
        console.log('gsdthis.modes', this.modes)
    }
    run (name, args = {}, rawArgv = []) {
        console.log('gsdrun', name, args, rawArgv)
        const mode = args.mode || (name === 'build' && args.watch ? 'development' : this.modes[name])
        this.setPluginsToSkip(args)
        this.init(mode)
        args._ = args._ || []
        let command = this.commands[name]
        if (!command && name) {
            error(`command "${name}" does not exist.`)
            process.exit(1)
        }
        if (!command || args.help || args.h) {
            command = this.commands.help
        } else {
            args._.shift() // remove command itself
            rawArgv.shift()
        }
        const { fn } = command
        console.log('gsdfn', args, rawArgv)
        return fn(args, rawArgv)
    }
    init (mode = process.env.VUE_CLI_MODE) {
        if (this.initialized) {
            return
        }
        this.initialized = true
        this.mode = mode
        if (mode) {
            this.loadEnv(mode)
        }
        this.loadEnv()
        const userOptions = this.loadUserOptions()
        this.projectOptions = defaultsDeep(userOptions, defaults())
        console.log('gsdthis.plugins', this.plugins)
        this.plugins.forEach(({ id, apply }) => {
            if (this.pluginsToSkip.has(id)) return
            apply(new PluginAPI(id, this), this.projectOptions)
        })
        if (this.projectOptions.chainWebpack) {
            // TODO
        }
        if (this.projectOptions.configureWebpack) {
            // TODO
        }
    }
    loadUserOptions () {
        let fileConfig, pkgConfig, resolved, resolvedFrom
        const configPath = path.resolve(this.context, 'vue.config.js')
        if (fs.existsSync(configPath)) {
            try {
                fileConfig = require(configPath)
            } catch (e) {
                error(`Error loading ${chalk.bold('vue.config.js')}:`)
                throw e
            }
        }
        pkgConfig = this.pkg.vue
        if (pkgConfig && typeof pkgConfig !== 'object') {
            error(
                `Error loading vue-cli config in ${chalk.bold(`package.json`)}: ` +
                `the "vue" field should be an object.`
            )
            pkgConfig = null
        }
        if (fileConfig) {
            if (pkgConfig) {
                warn(
                    `"vue" field in package.json ignored ` +
                    `due to presence of ${chalk.bold('vue.config.js')}.`
                )
                warn(
                    `You should migrate it into ${chalk.bold('vue.config.js')} ` +
                    `and remove it from package.json.`
                )
            }
            resolved = fileConfig
            resolvedFrom = 'vue.config.js'
        } else if (pkgConfig) {
            resolved = pkgConfig
            resolvedFrom = '"vue" field in package.json'
        } else {
            resolved = this.inlineOptions || {}
            resolvedFrom = 'inline options'
        }
        if (typeof resolved.baseUrl !== 'undefined') {
            if (typeof resolved.publicPath !== 'undefined') {
                warn(
                    `You have set both "baseUrl" and "publicPath" in ${chalk.bold('vue.config.js')}, ` +
                    `in this case, "baseUrl" will be ignored in favor of "publicPath".`
                )
            }else {
                warn(
                    `"baseUrl" option in ${chalk.bold('vue.config.js')} ` +
                    `is deprecated now, please use "publicPath" instead.`
                )
                resolved.publicPath = resolved.baseUrl
            }
        }
        ensureSlash(resolved, 'publicPath')
        if (typeof resolved.publicPath === 'string') {
            resolved.publicPath = resolved.publicPath.replace(/^\.\//, '')
        }
        resolved.baseUrl = resolved.publicPath
        removeSlash(resolved, 'outputDir')
        validate(resolved, msg => {
            error(
                `Invalid options in ${chalk.bold(resolvedFrom)}: ${msg}`
            )
        })
        return resolved
    }
    loadEnv (mode) {
        const logger = debug('vue:env')
        const basePath = path.resolve(this.context, `.env${mode ? `.${mode}` : ``}`)
        const localPath = `${basePath}.local`
        console.log('gsdlocalPath', localPath)
        const load = path => {
            try {
                const env = dotenv.config({ path, debug: process.env.DEBUG })
                dotenvExpand(env)
                logger(path, env)
            } catch (err) {

            }
        }
        load(localPath)
        load(basePath)
        const shouldForceDefaultEnv = ''
        if (mode) {
            const defaultNodeEnv = 'development'
            if (shouldForceDefaultEnv || process.env.NODE_ENV == null) {
                process.env.NODE_ENV = defaultNodeEnv
            }
            if (shouldForceDefaultEnv || process.env.BABEL_ENV == null) {
                process.env.BABEL_ENV = defaultNodeEnv
            }
        }
    }
    setPluginsToSkip (args) {
        const skipPlugins = args['skip-plugins']
        const pluginsToSkip = new Set() // TODO
        this.pluginsToSkip = pluginsToSkip
    }
    resolvePlugins (inlinePlugins, useBuiltIn) {
        const idToPlugin = id => ({
            id: id.replace(/^.\//, 'built-in:'),
            apply: require(id)
        })
        let plugins
        const builtInPlugins = [
            './commands/serve',
            './commands/build',
            './commands/inspect',
            './commands/help',
            // config plugins are order sensitive
            './config/base',
            './config/css',
            './config/dev',
            './config/prod',
            './config/app'
        ].map(idToPlugin)
        if (inlinePlugins) {
            // TODO
        }else {
            console.log('gsdthis.pkg', this.pkg)
            const projectPlugins = Object.keys(this.pkg.devDependencies || {})
                .concat(Object.keys(this.pkg.dependencies || {}))
                .filter(isPlugin)// TODO
            console.log('gsdprojectPlugins', projectPlugins)
            plugins = builtInPlugins.concat(projectPlugins)
            console.log('gsdplugins', plugins)
        }
        if (this.pkg.vuePlugins && this.pkg.vuePlugins.service) {

        }
        return plugins
    }
    resolvePkg (inlinePkg, context = this.context) {
        console.log('gsdinlinePkg', inlinePkg)
        if (inlinePkg) {
            return inlinePkg
        } else if (fs.existsSync(path.join(context, 'package.json'))) {
            console.log('gsd111')
            const pkg = readPkg.sync({ cwd: context })
            if (pkg.vuePlugins && pkg.vuePlugins.resolveFrom) {

            }
            return pkg
        }else {
            return {}
        }
    }
    resolveChainableWebpackConfig () {
        const chainableConfig = new Config()
        this.webpackChainFns.forEach(fn => fn(chainableConfig))
        return chainableConfig
    }
    resolveWebpackConfig (chainableConfig = this.resolveChainableWebpackConfig()) {
        let config = chainableConfig.toConfig()
        // TODO
        return config
    }
}
