const inquirer = require('inquirer')
const cloneDeep = require('lodash.clonedeep')
const chalk = require('chalk')
const semver = require('semver')
const { formatFeatures } = require('./util/features')
const { clearConsole } = require('./util/clearConsole')
const getVersions = require('./util/getVersions')
const writeFileTree = require('./util/writeFileTree')
const { installDeps } = require('./util/installDeps')
const PromptModuleAPI = require('./PromptModuleAPI')
const sortObject = require('./util/sortObject')
const {
    log,
    hasYarn,
    logWithSpinner,
    stopSpinner,
    hasPnpm3OrLater,
    loadModule
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
        this.context = context
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
        const { name, context } = this
        if (!preset) {
            if (cliOptions.preset) {

            } else if (cliOptions.default) {

            } else if (cliOptions.inlinePreset) {

            } else {
                preset = await this.promptAndResolvePreset()
            }
        }
        preset = cloneDeep(preset)
        preset.plugins['@vue/cli-service'] = Object.assign({
            projectName: name
        }, preset)
        console.log('gsdpreset', preset)
        const packageManager = 'npm'
        clearConsole()
        logWithSpinner(`✨`, `Creating project in ${chalk.yellow(context)}.`)
        const { current } = getVersions()
        const currentMinor = `${semver.major(current)}.${semver.minor(current)}.0`
        const pkg = {
            name,
            version: '0.1.0',
            private: true,
            devDependencies: {}
        }
        const deps = Object.keys(preset.plugins)
        deps.forEach(dep => {
            pkg.devDependencies[dep] = (
                preset.plugins[dep].version ||
                ((/^@vue/.test(dep)) ? `^${currentMinor}` : `latest`)
            )
        })
        console.log('gsdpkg', pkg)
        writeFileTree(context, {
            'package.json': JSON.stringify(pkg, null, 2)
        })
        stopSpinner()
        log(`⚙  Installing CLI plugins. This might take a while...`)
        log()
        if (false) {

        }else {
            // await installDeps(context, packageManager, cliOptions.registry)
        }
        log(`🚀  Invoking generators...`)
        const plugins = this.resolvePlugins(preset.plugins)
        console.log('gsdplugins', plugins)
    }
    resolvePlugins (rawPlugins) {
        rawPlugins = sortObject(rawPlugins, ['@vue/cli-service'], false)
        const plugins = []
        for (const id of Object.keys(rawPlugins)) {
            const apply = loadModule(`${id}/generator`, this.context) || (() => {})
            let options = rawPlugins[id] || {}
            if (options.prompts) {
            }
            plugins.push({ id, apply, options })
        }
        return plugins
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
