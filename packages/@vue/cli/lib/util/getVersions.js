const { loadOptions } = require('../options')
let sessionCached
module.exports = function getVersions () {
    let latest
    const local = require(`../../package.json`).version
    const { latestVersion = local, lastChecked = 0 } = loadOptions()
    const cached = latestVersion
    const daysPassed = (Date.now() - lastChecked) / (60 * 60 * 1000 * 24)
    if (daysPassed > 1) {
        latest = cached
    } else {
        latest = cached
    }
    return (sessionCached = {
        current: local,
        latest
    })
}
