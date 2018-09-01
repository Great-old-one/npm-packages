"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.preAllfilesName = preAllfilesName;

var _chalk = require("chalk");

var _chalk2 = _interopRequireDefault(_chalk);

var _lodash = require("lodash");

var _lodash2 = _interopRequireDefault(_lodash);

var _getMiniDir = require("./utils/getMiniDir");

var _getMiniDir2 = _interopRequireDefault(_getMiniDir);

var _checkFileType = require("./utils/checkFileType");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var path = require("path");


async function getDepedences(file, options, packages) {
    var source = file.source();
    var content = void 0;
    var jsonSource = void 0;
    try {
        jsonSource = JSON.parse(source);
        content = jsonSource.usingComponents;
    } catch (e) {
        console.log(_chalk2.default.red(e));
    }
    if (!content) {
        return;
    }
    var tasks = [];

    Object.keys(content).forEach(function (item, index) {
        if (!(0, _checkFileType.isPackage)(content[item].charAt(0))) {
            var sourceDirname = content[item].split("/")[0];
            packages.push(sourceDirname);
            var allOptions = _lodash2.default.merge({}, options, { packageName: item });
            tasks.push(setRelation(jsonSource, allOptions));
        }
    });
    await Promise.all(tasks);
}

//create relativePath
function setRelation(source, options) {
    return new Promise(function (resolve, reject) {
        var to = options.to,
            compilation = options.compilation,
            notCreateRelative = options.notCreateRelative,
            filename = options.filename,
            packageName = options.packageName,
            baseFromPath = options.baseFromPath,
            count = options.count,
            distContext = options.distContext;

        if (notCreateRelative) {
            resolve();
            return;
        }
        var content = source.usingComponents;
        var absoluteFilePath = path.join(distContext, filename);
        var absoluteTargetPath = path.join(distContext, to);
        // is not first map, It is present npm package
        if (count > 1) {
            //hack,  because  filename is also a npm package and also under in miniprogram_npm
            absoluteFilePath = path.resolve(absoluteFilePath, "..");
        }
        var relativePath = path.relative(absoluteFilePath, absoluteTargetPath);

        var sourcePath = getSourcePath({ baseFromPath: baseFromPath, packagePath: content[packageName] });
        (0, _checkFileType.isDir)(compilation.inputFileSystem, sourcePath).then(function (flag) {
            var relationPath = path.join(relativePath, content[packageName]);
            if (flag) {
                relationPath = path.join(relationPath, "index");
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
            resolve();
        }).catch(function (err) {
            reject(err);
            console.log(_chalk2.default.red(err));
        });
    });
}

function getSourcePath(options) {
    var baseFromPath = options.baseFromPath,
        packagePath = options.packagePath;

    var packageNames = packagePath.split("/");
    var dirname = path.resolve(baseFromPath, packageNames[0]);
    var miniDir = (0, _getMiniDir2.default)(dirname);
    return path.resolve(dirname, miniDir, packageNames.slice(1).join("/"));
}

async function preAllfilesName(fileNames, globConfig) {
    var packages = [];
    var tasks = [];
    for (var key in fileNames) {
        if (fileNames.hasOwnProperty(key) && (0, _checkFileType.isJsonFile)(key)) {
            var options = _lodash2.default.merge({}, globConfig, { filename: key });
            tasks.push(getDepedences(fileNames[key], options, packages));
        }
    }
    await Promise.all(tasks);
    return [].concat(_toConsumableArray(new Set(packages)));
}