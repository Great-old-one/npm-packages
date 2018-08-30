import {writeFile} from "./writeFile";

const _ = require("lodash")
import {preAllfilesName} from "./preAllfilesName"
import readAllFiles from "./readAllFiles"

const path = require("path")
module.exports = class WxAppNpmPlugin {
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
        compiler.plugin('emit', (compilation, callback) => {
            //outPut path
            const distContext = compilation.options.output.path
            const fileNames = compilation.assets
            //read all json assets,and get packages from usingComponent


            const globConfig = {
                baseFromPath: path.relative(context, this.options.from),
                compilation,
                distContext,
                to: this.options.to
            }
            packages = preAllfilesName(fileNames, globConfig)
            //read all sourceFile
            const tasks = []
            packages.forEach((item) => {
                const {from} = this.options
                const basePath = path.resolve(context, from)
                tasks.push(readAllFiles(basePath, item))
            })

            //write all files
            Promise.all(tasks).then((files) => {
                const fileList = _.flatten(files)
                const writeTasks = []
                fileList.forEach((file) => {
                    writeTasks.push(writeFile(file, globConfig))
                })
                return Promise.all(writeTasks)
            }).then(() => {
                callback()
            }).catch((err) => {
                console.error(err)
            })
        });
    };
}