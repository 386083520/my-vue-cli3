const inquirer = require('inquirer')
const cloneDeep = require('lodash.clonedeep')
const { formatFeatures } = require('./util/features')
const { clearConsole } = require('./util/clearConsole')
const PromptModuleAPI = require('./PromptModuleAPI')
const {
    defaults,
    loadOptions,
    validatePreset
} = require('./options')

const isManualMode = answers => answers.preset === '__manual__'

module.exports = class Creator {
    constructor (name, context, promptModules) {
        this.name = name
        const { presetPrompt, featurePrompt } = this.resolveIntroPrompts()
        this.presetPrompt = presetPrompt
        this.featurePrompt = featurePrompt
        this.outroPrompts = this.resolveOutroPrompts()
        this.injectedPrompts = []
        const promptAPI = new PromptModuleAPI(this)
        promptModules.forEach(m => m(promptAPI))
    }
    async create (cliOptions = {}, preset = null) {
        if (!preset) {
            if (cliOptions.preset) {

            } else if (cliOptions.default) {

            } else if (cliOptions.inlinePreset) {

            } else {
                preset = await this.promptAndResolvePreset()
            }
        }
        preset = cloneDeep(preset)
        console.log('gsdpreset', preset)
    }
    async promptAndResolvePreset (answers = null) {
        if (!answers) {
            clearConsole(true)
            answers = await inquirer.prompt(this.resolveFinalPrompts())
        }
        console.log('gsdanswers', answers)
        let preset
        if (answers.preset && answers.preset !== '__manual__') {
            preset = this.resolvePreset(answers.preset)
        }else {

        }
        validatePreset(preset)
        return preset
    }
    resolveFinalPrompts () {
        const prompts = [
            this.presetPrompt,
            this.featurePrompt,
            ...this.injectedPrompts,
            ...this.outroPrompts
        ]
        return prompts
    }
    getPresets () {
        const savedOptions = loadOptions()
        return Object.assign({}, savedOptions.presets, defaults.presets)
    }
    resolveIntroPrompts () {
        const presets = this.getPresets()
        const presetChoices = Object.keys(presets).map(name => {
            return {
                name: `${name} (${formatFeatures(presets[name])})`,
                value: name
            }
        })
        const presetPrompt = {
            name: 'preset',
            type: 'list',
            message: `Please pick a preset:`,
            choices: [
                ...presetChoices,
                {
                    name: 'Manually select features',
                    value: '__manual__'
                }
            ]
        }
        const featurePrompt = {
            name: 'features',
            when: isManualMode,
            type: 'checkbox',
            message: 'Check the features needed for your project:',
            choices: [],
            pageSize: 10
        }
        return {
            presetPrompt,
            featurePrompt
        }
    }
    resolveOutroPrompts () {
        return []
    }
    resolvePreset (name, clone) {
        let preset
        if (name === 'default' && !preset) {
            preset = defaults.presets.default
        }
        return preset
    }
}
