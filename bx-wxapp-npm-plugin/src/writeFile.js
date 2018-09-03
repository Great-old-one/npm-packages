const path = require("path")

export function writeFile(file, options) {
    const {filePath, dirname, absolutePath} = file
    const {compilation, to} = options
    const toPath = path.join(to, dirname, filePath.replace(/\\/g, '/'))
    return new Promise((resolve, reject) => {
        compilation.inputFileSystem.stat(absolutePath, (err, stat) => {
            if (err) {
                reject(err)
                return
            }
            if (stat.isDirectory()) {
                resolve()
                return
            }
            compilation.inputFileSystem.readFile(absolutePath, (err, content) => {
                if (err) {
                    reject(err)
                    return
                }
                compilation.assets[toPath] = {
                    size: function () {
                        return content.size;
                    },
                    source: function () {
                        return content;
                    }
                };
                resolve()
            })
        })
    })
}
