const { toShortPluginId } = require('@vue/cli-shared-utils')
const chalk = require('chalk')
exports.getFeatures = (preset) => {
    const features = []
    if (preset.router) {
        features.push('vue-router')
    }
    if (preset.vuex) {
        features.push('vuex')
    }
    if (preset.cssPreprocessor) {
        features.push(preset.cssPreprocessor)
    }
    const plugins = Object.keys(preset.plugins)
    features.push.apply(features, plugins)
    return features
}
exports.formatFeatures = (preset, lead, joiner) => {
    const features = exports.getFeatures(preset)
    return features.map(dep => {
        dep = toShortPluginId(dep)
        return `${lead || ''}${chalk.yellow(dep)}`
    }).join(joiner || ', ')
}
