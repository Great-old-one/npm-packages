"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.isDir = exports.isJsonFile = exports.isPackage = undefined;

var _promisify = require("./promisify");

function isPackage(str) {
    var pathPattern = /^(\.|\/)/;
    return pathPattern.test(str);
}

function isJsonFile(filename) {
    var pattern = /\.json$/;
    return pattern.test(filename);
}

function isDir(fs, filePath) {
    return new Promise(function (resolve, reject) {
        (0, _promisify.stat)(fs, filePath).then(function (stats) {
            resolve(stats.isDirectory());
        }).catch(function () {
            var newPath = filePath + ".js";
            return (0, _promisify.stat)(fs, newPath);
        }).then(function (stats) {
            if (stats && stats.isFile()) {
                resolve(false);
            } else {
                reject("is not effect package's path");
            }
        }).catch(function (err) {
            reject(err);
        });
    });
}

exports.isPackage = isPackage;
exports.isJsonFile = isJsonFile;
exports.isDir = isDir;