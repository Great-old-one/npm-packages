import globby from "globby";
import getMiniDir from "./utils/getMiniDir";

const path = require("path")
export default function (nodePath, dirname) {
    const basePath = path.resolve(nodePath, dirname)
    const cwd = path.resolve(basePath, getMiniDir(basePath))
    return new Promise((resolve, reject) => {
        globby("**/*", {cwd})
            .then((files) => {
                const fileList = files.map((file) => {
                    return {
                        dirname,
                        filePath: file,
                        absolutePath: path.resolve(cwd, file)
                    }
                })
                resolve(fileList)
            }).catch((err) => {
            reject(err)
        })
    })
}