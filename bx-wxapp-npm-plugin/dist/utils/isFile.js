"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

exports.default = function (fs, filePath) {
    return new Promise(function (resolve, reject) {
        (0, _promisify.stat)(fs, filePath).then(function (stats) {
            resolve(stats.isFile());
        }).catch(function () {
            var newPath = filePath + ".js";
            return (0, _promisify.stat)(fs, newPath);
        }).then(function (stats) {
            resolve(stats.isFile());
        }).catch(function (err) {
            console.error(err);
            reject(err);
        });
    });
};

var _promisify = require("./promisify");