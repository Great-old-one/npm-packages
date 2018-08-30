import {stat} from "./promisify";

export default function (fs, filePath) {
    return new Promise((resolve, reject) => {
        stat(fs, filePath).then((stats) => {
            resolve(stats.isFile())
        }).catch(() => {
            const newPath = filePath + ".js"
            return stat(fs, newPath)
        }).then((stats) => {
            resolve(stats.isFile())
        }).catch((err) => {
            console.error(err)
            reject(err)
        })
    })
}