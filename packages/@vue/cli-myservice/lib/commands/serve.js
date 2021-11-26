module.exports = (api, options) => {
    api.registerCommand('serve', {}, function serve (args) {
        console.log('gsdserve')
    })
}
module.exports.defaultModes = {
    serve: 'development'
}

