const {
    info
} = require('@vue/cli-shared-utils')

module.exports = (api, options) => {
    api.registerCommand('serve', {}, function serve (args) {
        info('Starting development server...')
        const validateWebpackConfig = require('../util/validateWebpackConfig')
        const webpackConfig = api.resolveWebpackConfig()
        console.log('gsdwebpackConfig', webpackConfig)
        validateWebpackConfig(webpackConfig, api, options)
    })
}
module.exports.defaultModes = {
    serve: 'development'
}

