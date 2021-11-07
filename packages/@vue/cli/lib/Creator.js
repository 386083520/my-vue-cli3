const { clearConsole } = require('./util/clearConsole')
module.exports = class Creator {
    constructor (name, context, promptModules) {
        this.name = name
    }
    create (cliOptions = {}, preset = null) {
        if (!preset) {
            if (cliOptions.preset) {

            } else if (cliOptions.default) {

            } else if (cliOptions.inlinePreset) {

            } else {
                preset = this.promptAndResolvePreset()
            }
        }
    }
    promptAndResolvePreset (answers = null) {
        if (!answers) {
            clearConsole(true)
            // answers = inquirer.prompt(this.resolveFinalPrompts())
        }
    }
}
