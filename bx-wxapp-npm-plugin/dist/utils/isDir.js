"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

exports.default = function (fs, filePath) {
    return new Promise(function (resolve, reject) {
        fs.stat(filePath, function (err, stat) {
            if (err) {
                reject(err);
                return;
            }
            resolve(stat.isDirectory());
        });
    });
};