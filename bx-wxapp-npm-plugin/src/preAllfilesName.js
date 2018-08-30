import getMiniDir from "./utils/getMiniDir";

const path = require("path")
import _ from "lodash"
import isFile from "./utils/isFile"

function isPackage(str) {
    const pathPattern = /^(\.|\/)/
    return pathPattern.test(str)
}

function isJsonFile(filename) {
    const pattern = /\.json$/
    return pattern.test(filename)
}

function getDepedences(file, options) {
    let packages = []
    var source = file.source();
    const jsonSource = JSON.parse(source)
    const content = jsonSource.usingComponents
    if (content) {
        Object.keys(content).forEach((item, index) => {
            if (!isPackage(content[item].charAt(0))) {
                const sourceDirname = content[item].split("/")[0]
                packages.push(sourceDirname)
                setRelation(jsonSource, _.merge({}, options, {packageName: item}))
            }
        })
    }
    return packages
}


//create relativePath
function setRelation(source, options) {
    const {to, compilation, notCreateRelative, filename, packageName, baseFromPath} = options
    if (!notCreateRelative) {
        const content = source.usingComponents
        const relativePath = path.relative(filename, to)
        const sourcePath = getSourcePath({baseFromPath, packagePath: content[packageName]})
        isFile(compilation.inputFileSystem, sourcePath).then((flag) => {
            let relationPath = path.join(relativePath, content[packageName])
            if (!flag) {
                relationPath = path.join(relativePath, content[packageName], "index")
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
        }).catch((err) => {
            console.error(err)
        })
    }
}

function getSourcePath(options) {
    const {baseFromPath, packagePath} = options
    const packageNames = packagePath.split("/")
    const dirname = path.resolve(baseFromPath, packageNames[0])
    const miniDir = getMiniDir(dirname)
    return path.resolve(dirname, miniDir, packageNames.slice(1).join("/"))
}

export function preAllfilesName(fileNames, globConfig) {
    let packages = []
    for (let key in fileNames) {
        if (fileNames.hasOwnProperty(key) && isJsonFile(key)) {

            const options = _.merge({}, globConfig, {filename: key})
            packages = packages.concat(getDepedences(fileNames[key], options))
        }
    }

    return [...new Set(packages)]
}

