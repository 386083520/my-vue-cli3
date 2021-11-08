const inquirer = require('inquirer')
const cloneDeep = require('lodash.clonedeep')
const { formatFeatures } = require('./util/features')
const { clearConsole } = require('./util/clearConsole')
const PromptModuleAPI = require('./PromptModuleAPI')
const {
    hasYarn,
    hasPnpm3OrLater
} = require('@vue/cli-shared-utils')
const {
    defaults,
    loadOptions,
    validatePreset,
    savePreset
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
        this.promptCompleteCbs = []
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
            preset = {
                useConfigFiles: answers.useConfigFiles === 'files',
                plugins: {}
            }
            answers.features = answers.features || []
            this.promptCompleteCbs.forEach(cb => cb(answers, preset))
        }
        validatePreset(preset)
        if (answers.save && answers.saveName) {
            savePreset(answers.saveName, preset)
        }
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
        const outroPrompts = [{
            name: 'save',
            when: isManualMode,
            type: 'confirm',
            message: 'Save this as a preset for future projects?',
            default: false
        },
        {
            name: 'saveName',
            when: answers => answers.save,
            type: 'input',
            message: 'Save preset as:'
        }]
        const savedOptions = loadOptions()
        if (!savedOptions.packageManager && (hasYarn() || hasPnpm3OrLater())) {
            const packageManagerChoices = []
            if (hasYarn()) {
                packageManagerChoices.push({
                    name: 'Use Yarn',
                    value: 'yarn',
                    short: 'Yarn'
                })
            }
            if (hasPnpm3OrLater()) {
                packageManagerChoices.push({
                    name: 'Use PNPM',
                    value: 'pnpm',
                    short: 'PNPM'
                })
            }
            packageManagerChoices.push({
                name: 'Use NPM',
                value: 'npm',
                short: 'NPM'
            })
            outroPrompts.push({
                name: 'packageManager',
                type: 'list',
                message: 'Pick the package manager to use when installing dependencies:',
                choices: packageManagerChoices
            })
        }
        return outroPrompts
    }
    resolvePreset (name, clone) {
        let preset
        const savedPresets = loadOptions().presets || {}
        if (name in savedPresets) {
            preset = savedPresets[name]
        }
        if (name === 'default' && !preset) {
            preset = defaults.presets.default
        }
        return preset
    }
}
