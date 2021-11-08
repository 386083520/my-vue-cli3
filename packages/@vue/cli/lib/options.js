const fs = require('fs')
const rcPath = ''
let cachedOptions
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
