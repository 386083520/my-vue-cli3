const fs = require('fs')
const path = require('path')
const readPkg = require('read-pkg')
const { isPlugin } = require('@vue/cli-shared-utils')
module.exports = class Service {
    constructor (context, { plugins, pkg, inlineOptions, useBuiltIn } = {}) {
        this.context = context
        this.pkg = this.resolvePkg(pkg)
        this.plugins = this.resolvePlugins(plugins, useBuiltIn)
        this.modes = this.plugins.reduce((modes, { apply: { defaultModes }}) => {
            return Object.assign(modes, defaultModes)
        }, {})
        console.log('gsdthis.modes', this.modes)
    }
    run (name, args = {}, rawArgv = []) {
        console.log('gsdrun', name, args, rawArgv)
        const mode = args.mode || (name === 'build' && args.watch ? 'development' : this.modes[name])
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
