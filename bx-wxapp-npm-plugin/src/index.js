import {writeFile} from "./writeFile";


const _ = require("lodash")
import {preAllfilesName} from "./preAllfilesName"
import readAllFiles from "./readAllFiles"

const path = require("path")

class WxAppNpmPlugin {
    constructor(options = {}) {
        this.options = _.merge({
            // package source
            from: "node_modules",
            //where include package in output dir
            to: "miniprogram_npm",
            notCreateRelative: false
        }, options)
    }

    apply(compiler) {
        const options = this.options
        let context;
        let packages = []
        if (!options.context) {
            context = compiler.options.context;
        } else if (!path.isAbsolute(options.context)) {
            context = path.join(compiler.options.context, options.context);
        } else {
            context = options.context;
        }
        let allPackages = []

        compiler.plugin('emit', (compilation, callback) => {
            //outPut path
            //map count
            let count = 0
            const emit = async (globConfig = {}) => {
                count++
                const {compilation, notCreateRelative} = globConfig
                const fileNames = compilation.assets
                globConfig.count = count
                //read all json assets,and get packages from usingComponent
                packages = await preAllfilesName(fileNames, globConfig)

                //stop generate
                if (count > 1 && notCreateRelative) {
                    return true
                }
                if (!packages || packages.length === 0) {
                    return true
                }
                //read all sourceFile
                const tasks = []
                packages.forEach((item) => {
                    if (allPackages.includes(item)) {
                        return
                    }
                    allPackages.push(item)
                    const {from} = this.options
                    const basePath = path.resolve(context, from)
                    tasks.push(readAllFiles(basePath, item))
                })
                const files = await Promise.all(tasks)
                const fileList = _.flatten(files)
                const writeTasks = []
                fileList.forEach((file) => {
                    writeTasks.push(writeFile(file, globConfig))
                })
                await Promise.all(writeTasks)
                //handle a package invoke anther package
                return emit(globConfig)
            }
            const distContext = compilation.options.output.path
            const globConfig = {
                baseFromPath: path.relative(context, this.options.from),
                compilation,
                distContext,
                to: this.options.to,
                notCreateRelative: this.options.notCreateRelative
            }
            emit(globConfig).then(() => {
                callback()
            }).catch((err) => {
                console.log(err)
            })
        });
    };
}

module.exports = WxAppNpmPlugin