"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _writeFile = require("./writeFile");

var _preAllfilesName = require("./preAllfilesName");

var _readAllFiles = require("./readAllFiles");

var _readAllFiles2 = _interopRequireDefault(_readAllFiles);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _ = require("lodash");


var path = require("path");

var WxAppNpmPlugin = function () {
    function WxAppNpmPlugin() {
        var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

        _classCallCheck(this, WxAppNpmPlugin);

        this.options = _.merge({
            // package source
            from: "node_modules",
            //where include package in output dir
            to: "miniprogram_npm",
            notCreateRelative: false
        }, options);
    }

    _createClass(WxAppNpmPlugin, [{
        key: "apply",
        value: function apply(compiler) {
            var _this = this;

            var options = this.options;
            var context = void 0;
            var packages = [];
            if (!options.context) {
                context = compiler.options.context;
            } else if (!path.isAbsolute(options.context)) {
                context = path.join(compiler.options.context, options.context);
            } else {
                context = options.context;
            }
            var allPackages = [];

            compiler.plugin('emit', function (compilation, callback) {
                //outPut path
                //map count
                var count = 0;
                var emit = async function emit() {
                    var globConfig = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

                    count++;
                    var compilation = globConfig.compilation,
                        notCreateRelative = globConfig.notCreateRelative;

                    var fileNames = compilation.assets;
                    globConfig.count = count;
                    //read all json assets,and get packages from usingComponent
                    packages = await (0, _preAllfilesName.preAllfilesName)(fileNames, globConfig);

                    //stop generate
                    if (count > 1 && notCreateRelative) {
                        return true;
                    }
                    if (!packages || packages.length === 0) {
                        return true;
                    }
                    //read all sourceFile
                    var tasks = [];
                    packages.forEach(function (item) {
                        if (allPackages.includes(item)) {
                            return;
                        }
                        allPackages.push(item);
                        var from = _this.options.from;

                        var basePath = path.resolve(context, from);
                        tasks.push((0, _readAllFiles2.default)(basePath, item));
                    });
                    var files = await Promise.all(tasks);
                    var fileList = _.flatten(files);
                    var writeTasks = [];
                    fileList.forEach(function (file) {
                        writeTasks.push((0, _writeFile.writeFile)(file, globConfig));
                    });
                    await Promise.all(writeTasks);
                    //handle a package invoke anther package
                    return emit(globConfig);
                };
                var distContext = compilation.options.output.path;
                var globConfig = {
                    baseFromPath: path.relative(context, _this.options.from),
                    compilation: compilation,
                    distContext: distContext,
                    to: _this.options.to,
                    notCreateRelative: _this.options.notCreateRelative
                };
                emit(globConfig).then(function () {
                    callback();
                }).catch(function (err) {
                    console.log(err);
                });
            });
        }
    }]);

    return WxAppNpmPlugin;
}();

module.exports = WxAppNpmPlugin;