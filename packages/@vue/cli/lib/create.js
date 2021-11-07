const path = require('path')
const fs = require('fs-extra')
const Creator = require('./Creator')
const { getPromptModules } = require('./util/createTools')
function create (projectName, options) {
    const cwd = options.cwd || process.cwd()
    console.log('gsdcwd', cwd)
    const inCurrent = projectName === '.'
    console.log('gsdinCurrent', inCurrent)
    const name = inCurrent ? path.relative('../', cwd) : projectName
    console.log('gsdname', name)
    const targetDir = path.resolve(cwd, projectName || '.')
    console.log('gsdtargetDir', targetDir)
    if (fs.existsSync(targetDir)) {
        console.log('gsdexistsSync')
    }
    const creator = new Creator(name, targetDir, getPromptModules())
    creator.create(options)
}
module.exports = create

