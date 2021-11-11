const fs = require('fs')
const path = require('path')
const readPkg = require('read-pkg')
const { isPlugin } = require('@vue/cli-shared-utils')
const debug = require('debug')
const dotenv = require('dotenv')
const dotenvExpand = require('dotenv-expand')
module.exports = class Service {
    constructor (context, { plugins, pkg, inlineOptions, useBuiltIn } = {}) {
        this.context = context
        this.initialized = false
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
}
