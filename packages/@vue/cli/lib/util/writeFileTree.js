const fs = require('fs-extra')
const path = require('path')
module.exports = function writeFileTree (dir, files, previousFiles) {
    if (previousFiles) {

    }
    Object.keys(files).forEach(name => {
        const filePath = path.join(dir, name)
        fs.ensureDirSync(path.dirname(filePath))
        fs.writeFileSync(filePath, files[name])
    })
}
