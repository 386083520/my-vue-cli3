const { hasYarn, request } = require('@vue/cli-shared-utils')
const { loadOptions } = require('../options')
let checked
let result
module.exports = async function shouldUseTaobao (command) {
    if (!command) {
        command = hasYarn() ? 'yarn' : 'npm'
    }
    if (checked) return result
    checked = true

    const saved = loadOptions().useTaobaoRegistry
    if (typeof saved === 'boolean') {
        return (result = saved)
    }
    return false
}
