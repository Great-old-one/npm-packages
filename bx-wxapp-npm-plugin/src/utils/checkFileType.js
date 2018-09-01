import {stat} from "./promisify";


function isPackage(str) {
    const pathPattern = /^(\.|\/)/
    return pathPattern.test(str)
}

function isJsonFile(filename) {
    const pattern = /\.json$/
    return pattern.test(filename)
}

function isDir(fs, filePath) {
    return new Promise((resolve, reject) => {
        stat(fs, filePath).then((stats) => {
            resolve(stats.isDirectory())
        }).catch(() => {
            const newPath = filePath + ".js"
            return stat(fs, newPath)
        }).then((stats) => {
            if (stats && stats.isFile()) {
                resolve(false)
            } else {
                reject("is not effect package's path")
            }
        }).catch((err) => {
            reject(err)
        })
    })
}

export {isPackage, isJsonFile, isDir}