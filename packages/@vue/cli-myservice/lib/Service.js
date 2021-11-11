module.exports = class Service {
    constructor (context, { plugins, pkg, inlineOptions, useBuiltIn } = {}) {
        this.context = context
    }
    run (name, args = {}, rawArgv = []) {
        console.log('gsdrun', name, args, rawArgv)
    }
}
