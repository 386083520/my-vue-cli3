const fs = require('fs')
const { validate, createSchema } = require('@vue/cli-shared-utils/lib/validate')
const { error } = require('@vue/cli-shared-utils/lib/logger')
const cloneDeep = require('lodash.clonedeep')
const { getRcPath } = require('./util/rcPath')
const rcPath = getRcPath('.vuerc')
let cachedOptions

const presetSchema = createSchema(joi => joi.object().keys({
    bare: joi.boolean(),
    useConfigFiles: joi.boolean(),
    router: joi.boolean(),
    routerHistoryMode: joi.boolean(),
    vuex: joi.boolean(),
    // TODO: remove 'sass' or make it equivalent to 'dart-sass' in v4
    cssPreprocessor: joi.string().only(['sass', 'dart-sass', 'node-sass', 'less', 'stylus']),
    plugins: joi.object().required(),
    configs: joi.object()
}))

const schema = createSchema(joi => joi.object().keys({
    latestVersion: joi.string().regex(/^\d+\.\d+\.\d+$/),
    lastChecked: joi.date().timestamp(),
    packageManager: joi.string().only(['yarn', 'npm', 'pnpm']),
    useTaobaoRegistry: joi.boolean(),
    presets: joi.object().pattern(/^/, presetSchema)
}))

exports.loadOptions = () => {
    if (cachedOptions) {
        return cachedOptions
    }
    if (fs.existsSync(rcPath)) {
        try {
            cachedOptions = JSON.parse(fs.readFileSync(rcPath, 'utf-8'))
        } catch (e) {
            error(
                `Error loading saved preferences: ` +
                `~/.vuerc may be corrupted or have syntax errors. ` +
                `Please fix/delete it and re-run vue-cli in manual mode.\n` +
                `(${e.message})`,
            )
            exit(1)
        }
        validate(cachedOptions, schema, () => {
            error(
                `~/.vuerc may be outdated. ` +
                `Please delete it and re-run vue-cli in manual mode.`
            )
        })
        return cachedOptions
    } else {
        return {}
    }
}

exports.defaultPreset = {
    router: false,
    vuex: false,
    useConfigFiles: false,
    cssPreprocessor: undefined,
    plugins: {
    }
}

exports.defaults = {
    presets: {
        'default': exports.defaultPreset
    }
}

exports.validatePreset = preset => validate(preset, presetSchema, msg => {
    error(`invalid preset options: ${msg}`)
})

exports.savePreset = (name, preset) => {
    const presets = cloneDeep(exports.loadOptions().presets || {})
    presets[name] = preset
    exports.saveOptions({ presets })
}

exports.saveOptions = toSave => {
    const options = Object.assign(cloneDeep(exports.loadOptions()), toSave)
    console.log('gsdtoSave', options)
    for (const key in options) {
        if (!(key in exports.defaults)) {
            delete options[key]
        }
    }
    try {
        console.log('gsdrcPath', rcPath)
        fs.writeFileSync(rcPath, JSON.stringify(options, null, 2))
    } catch (e) {
        error(
            `Error saving preferences: ` +
            `make sure you have write access to ${rcPath}.\n` +
            `(${e.message})`
        )
    }
}
