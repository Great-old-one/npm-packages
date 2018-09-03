import chalk from "chalk"

const path = require("path")
import _ from "lodash"
import getMiniDir from "./utils/getMiniDir";
import {isJsonFile, isPackage, isDir} from "./utils/checkFileType"

async function getDepedences(file, options, packages) {
    const source = file.source();
    let content
    let jsonSource
    try {
        jsonSource = JSON.parse(source)
        content = jsonSource.usingComponents
    } catch (e) {
        console.log(chalk.red(e))
    }
    if (!content) {
        return
    }
    const tasks = []

    Object.keys(content).forEach((item, index) => {
        if (!isPackage(content[item].charAt(0))) {
            const sourceDirname = content[item].split("/")[0]
            packages.push(sourceDirname)
            const allOptions = _.merge({}, options, {packageName: item})
            tasks.push(setRelation(jsonSource, allOptions))
        }
    })
    await Promise.all(tasks)
}


//create relativePath
function setRelation(source, options) {
    return new Promise((resolve, reject) => {
        const {
            to,
            compilation,
            notCreateRelative,
            filename,
            packageName,
            baseFromPath,
            count,
            distContext
        } = options
        if (notCreateRelative) {
            resolve()
            return
        }
        const content = source.usingComponents
        let absoluteFilePath = path.resolve(distContext, filename)
        let absoluteTargetPath = path.resolve(distContext, to)
        let relativePath = path.relative(path.dirname(absoluteFilePath), absoluteTargetPath)
        const sourcePath = getSourcePath({baseFromPath, packagePath: content[packageName]})
        isDir(compilation.inputFileSystem, sourcePath)
            .then((flag) => {
                let relationPath = path.join(relativePath, content[packageName])
                if (flag) {
                    relationPath = path.join(relationPath, "index")
                }
                content[packageName] = relationPath
                const newContent = JSON.stringify(_.assign({}, source, {usingComponents: content}))
                compilation.assets[filename] = {
                    source() {
                        return newContent
                    },
                    size() {
                        return newContent.length
                    }
                }
                resolve()
            }).catch((err) => {
            reject(err)
            console.log(chalk.red(err))
        })
    })

}

function getSourcePath(options) {
    const {baseFromPath, packagePath} = options
    const packageNames = packagePath.split("/")
    const dirname = path.resolve(baseFromPath, packageNames[0])
    const miniDir = getMiniDir(dirname)
    return path.resolve(dirname, miniDir, packageNames.slice(1).join("/"))
}

export async function preAllfilesName(fileNames, globConfig) {
    const packages = []
    const tasks = []
    for (let key in fileNames) {
        if (fileNames.hasOwnProperty(key) && isJsonFile(key)) {
            const options = _.merge({}, globConfig, {filename: key})
            tasks.push(getDepedences(fileNames[key], options, packages))
        }
    }
    await Promise.all(tasks)
    return [...new Set(packages)]
}




