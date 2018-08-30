"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.writeFile = writeFile;
function writeFile(file, options) {
    var filePath = file.filePath,
        dirname = file.dirname,
        absolutePath = file.absolutePath;
    var compilation = options.compilation,
        to = options.to;

    var toPath = to + "/" + dirname + "/" + filePath.replace(/\\/g, '/');
    return new Promise(function (resolve, reject) {
        compilation.inputFileSystem.stat(absolutePath, function (err, stat) {
            if (err) {
                reject(err);
                return;
            }
            if (stat.isDirectory()) {
                resolve();
                return;
            }
            compilation.inputFileSystem.readFile(absolutePath, function (err, content) {
                if (err) {
                    reject(err);
                    return;
                }
                compilation.assets[toPath] = {
                    size: function size() {
                        return content.size;
                    },
                    source: function source() {
                        return content;
                    }
                };
                resolve();
            });
        });
    });
}