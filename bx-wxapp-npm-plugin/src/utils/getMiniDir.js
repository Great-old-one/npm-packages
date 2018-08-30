const path = require("path")
export default function (filePath) {
    const absolutepath = path.resolve(filePath, "package.json")
    let dir = "miniprogram_dist"
    try{
        const config = require(absolutepath)
        if (config && config.miniprogram && typeof config.miniprogram === "string") {
            dir = config.miniprogram
        }
    }catch (e) {
        console.log(e)
    }
    return dir
}