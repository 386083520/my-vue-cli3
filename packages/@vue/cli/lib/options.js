const fs = require('fs')
let cachedOptions
const rcPath = ''
exports.loadOptions = () => {
    if (cachedOptions) {
        return cachedOptions
    }
    if (fs.existsSync(rcPath)) {

    } else {
        return {}
    }
}
