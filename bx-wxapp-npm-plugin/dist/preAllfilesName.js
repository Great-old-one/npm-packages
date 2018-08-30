"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.preAllfilesName = preAllfilesName;

var _getMiniDir = require("./utils/getMiniDir");

var _getMiniDir2 = _interopRequireDefault(_getMiniDir);

var _lodash = require("lodash");

var _lodash2 = _interopRequireDefault(_lodash);

var _isFile = require("./utils/isFile");

var _isFile2 = _interopRequireDefault(_isFile);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var path = require("path");


function isPackage(str) {
    var pathPattern = /^(\.|\/)/;
    return pathPattern.test(str);
}

function isJsonFile(filename) {
    var pattern = /\.json$/;
    return pattern.test(filename);
}

function getDepedences(file, options) {
    var packages = [];
    var source = file.source();
    var jsonSource = JSON.parse(source);
    var content = jsonSource.usingComponents;
    if (content) {
        Object.keys(content).forEach(function (item, index) {
            if (!isPackage(content[item].charAt(0))) {
                var sourceDirname = content[item].split("/")[0];
                packages.push(sourceDirname);
                setRelation(jsonSource, _lodash2.default.merge({}, options, { packageName: item }));
            }
        });
    }
    return packages;
}

//create relativePath
function setRelation(source, options) {
    var to = options.to,
        compilation = options.compilation,
        notCreateRelative = options.notCreateRelative,
        filename = options.filename,
        packageName = options.packageName,
        baseFromPath = options.baseFromPath;

    if (!notCreateRelative) {
        var content = source.usingComponents;
        var relativePath = path.relative(filename, to);
        var sourcePath = getSourcePath({ baseFromPath: baseFromPath, packagePath: content[packageName] });
        (0, _isFile2.default)(compilation.inputFileSystem, sourcePath).then(function (flag) {
            var relationPath = path.join(relativePath, content[packageName]);
            if (!flag) {
                relationPath = path.join(relativePath, content[packageName], "index");
            }
            content[packageName] = relationPath;
            var newContent = JSON.stringify(_lodash2.default.assign({}, source, { usingComponents: content }));
            compilation.assets[filename] = {
                source: function source() {
                    return newContent;
                },
                size: function size() {
                    return newContent.length;
                }
            };
        }).catch(function (err) {
            console.error(err);
        });
    }
}

function getSourcePath(options) {
    var baseFromPath = options.baseFromPath,
        packagePath = options.packagePath;

    var packageNames = packagePath.split("/");
    var dirname = path.resolve(baseFromPath, packageNames[0]);
    var miniDir = (0, _getMiniDir2.default)(dirname);
    return path.resolve(dirname, miniDir, packageNames.slice(1).join("/"));
}

function preAllfilesName(fileNames, globConfig) {
    var packages = [];
    for (var key in fileNames) {
        if (fileNames.hasOwnProperty(key) && isJsonFile(key)) {

            var options = _lodash2.default.merge({}, globConfig, { filename: key });
            packages = packages.concat(getDepedences(fileNames[key], options));
        }
    }

    return [].concat(_toConsumableArray(new Set(packages)));
}