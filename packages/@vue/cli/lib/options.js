const fs = require('fs')
const { validate, createSchema } = require('@vue/cli-shared-utils/lib/validate')
const { error } = require('@vue/cli-shared-utils/lib/logger')
const rcPath = ''
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

exports.loadOptions = () => {
    if (cachedOptions) {
        return cachedOptions
    }
    if (fs.existsSync(rcPath)) {

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
        '@vue/cli-plugin-babel': {},
        '@vue/cli-plugin-eslint': {
            config: 'base',
            lintOn: ['save']
        }
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
