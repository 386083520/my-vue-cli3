const writeFileTree = require('./util/writeFileTree')
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

    }

    resolveFiles () {

    }

    sortPkg () {

    }
}
