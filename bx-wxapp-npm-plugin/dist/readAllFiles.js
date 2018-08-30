"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

exports.default = function (nodePath, dirname) {
    var basePath = path.resolve(nodePath, dirname);
    var cwd = path.resolve(basePath, (0, _getMiniDir2.default)(basePath));
    return new Promise(function (resolve, reject) {
        (0, _globby2.default)("**/*", { cwd: cwd }).then(function (files) {
            var fileList = files.map(function (file) {
                return {
                    dirname: dirname,
                    filePath: file,
                    absolutePath: path.resolve(cwd, file)
                };
            });
            resolve(fileList);
        }).catch(function (err) {
            reject(err);
        });
    });
};

var _globby = require("globby");

var _globby2 = _interopRequireDefault(_globby);

var _getMiniDir = require("./utils/getMiniDir");

var _getMiniDir2 = _interopRequireDefault(_getMiniDir);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var path = require("path");