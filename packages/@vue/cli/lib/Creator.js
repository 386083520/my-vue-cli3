module.exports = class Creator {
    constructor (name, context, promptModules) {
        this.name = name
    }
    create (cliOptions = {}, preset = null) {
        console.log('class create')
    }
}
