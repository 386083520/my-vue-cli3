const writeFileTree = require('./util/writeFileTree')
const inferRootOptions = require('./util/inferRootOptions')
const GeneratorAPI = require('./GeneratorAPI')

const defaultConfigTransforms = {

}
const reservedConfigTransforms = {

}
const ensureEOL = str => {
    return str
}
module.exports = class Generator {
    constructor (context, {
        pkg = {},
        plugins = [],
        completeCbs = [],
        files = {},
        invoking = false
    } = {}) {
        this.context = context
        this.plugins = plugins
        this.originalPkg = pkg
        this.pkg = Object.assign({}, pkg)
        this.completeCbs = completeCbs
        this.invoking = invoking
        this.files = files
        this.configTransforms = {}

        const cliService = plugins.find(p => p.id === '@vue/cli-service')
        const rootOptions = cliService
            ? cliService.options
            : inferRootOptions(pkg)
        plugins.forEach(({ id, apply, options }) => {
            const api = new GeneratorAPI(id, this, options, rootOptions)
            apply(api, options, rootOptions, invoking)
        })
    }

    generate ({
                  extractConfigFiles = false,
                  checkExisting = false
              } = {}) {
        const initialFiles = Object.assign({}, this.files)
        this.extractConfigFiles(extractConfigFiles, checkExisting)
        this.resolveFiles()
        this.sortPkg()
        this.files['package.json'] = JSON.stringify(this.pkg, null, 2) + '\n'
        writeFileTree(this.context, this.files, initialFiles)
    }

    extractConfigFiles (extractAll, checkExisting) {
        const configTransforms = Object.assign({},
            defaultConfigTransforms,
            this.configTransforms,
            reservedConfigTransforms
        )
        const extract = key => {
            if(configTransforms[key] &&
                this.pkg[key] &&
                !this.originalPkg[key]) {
                const value = this.pkg[key]
                const configTransform = configTransforms[key]
                const res = configTransform.transform(
                    value,
                    checkExisting,
                    this.files,
                    this.context
                )
                const { content, filename } = res
                this.files[filename] = ensureEOL(content)
                delete this.pkg[key]
            }
        }
        if (extractAll) {
            for (const key in this.pkg) {
                extract(key)
            }
        } else {
            extract('vue')
            extract('babel')
        }
    }

    resolveFiles () {

    }

    sortPkg () {

    }
}
