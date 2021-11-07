const chalk = require('chalk')
const { clearConsole } = require('@vue/cli-shared-utils')
const getVersions = require('./getVersions')
exports.generateTitle = function (checkUpdate) {
    const { current, latest } = getVersions()
    console.log('gsdgetVersions', current, latest)
    let title = chalk.bold.blue(`Vue CLI v${current}`)
    return title
}

exports.clearConsole = function clearConsoleWithTitle (checkUpdate) {
    const title = exports.generateTitle(checkUpdate)
    clearConsole(title)
}
