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

}


exports.installDeps = function installDeps (targetDir, command, cliRegistry) {
    checkPackageManagerIsSupported(command)
    const args = packageManagerConfig[command].installDeps
    addRegistryToArgs(command, args, cliRegistry)
    executeCommand(command, args, targetDir)
}
