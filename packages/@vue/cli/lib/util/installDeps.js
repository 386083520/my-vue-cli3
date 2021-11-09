const execa = require('execa')
const shouldUseTaobao = require('./shouldUseTaobao')
const registries = require('./registries')

const supportPackageManagerList = ['npm', 'yarn', 'pnpm']

const packageManagerConfig = {
    npm: {
        installDeps: ['install', '--loglevel', 'error'],
        installPackage: ['install', '--loglevel', 'error'],
        uninstallPackage: ['uninstall', '--loglevel', 'error'],
        updatePackage: ['update', '--loglevel', 'error']
    }
}

function checkPackageManagerIsSupported (command) {
    if (supportPackageManagerList.indexOf(command) === -1) {
        throw new Error(`Unknown package manager: ${command}`)
    }
}

function addRegistryToArgs (command, args, cliRegistry) {
    const altRegistry = (
        cliRegistry || (
            (shouldUseTaobao(command))
                ? registries.taobao
                : null
        )
    )
    if (altRegistry) {

    }
}

function executeCommand (command, args, targetDir) {
    return new Promise((resolve, reject) => {
        const apiMode = process.env.VUE_CLI_API_MODE
        if (apiMode) {

        }
        console.log('gsdexecuteCommand', command, args, targetDir)
        const child = execa(command, args, {
            cwd: targetDir,
            stdio: ['inherit', apiMode ? 'pipe' : 'inherit', !apiMode && command === 'yarn' ? 'pipe' : 'inherit']
        })
        if (apiMode) {

        } else {
            console.log('gsdhere')
            if (command === 'yarn') {

            }
            child.on('close', code => {
                if (code !== 0) {
                    reject(`command failed: ${command} ${args.join(' ')}`)
                    return
                }
                resolve()
            })
        }
    })
}


exports.installDeps = async function installDeps (targetDir, command, cliRegistry) {
    checkPackageManagerIsSupported(command)
    const args = packageManagerConfig[command].installDeps
    addRegistryToArgs(command, args, cliRegistry)
    await executeCommand(command, args, targetDir)
}
