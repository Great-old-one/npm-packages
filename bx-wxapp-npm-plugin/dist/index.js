"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _writeFile = require("./writeFile");

var _getMiniDir = require("./utils/getMiniDir");

var _getMiniDir2 = _interopRequireDefault(_getMiniDir);

var _preAllfilesName = require("./preAllfilesName");

var _readAllFiles = require("./readAllFiles");

var _readAllFiles2 = _interopRequireDefault(_readAllFiles);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _ = require("lodash");


var path = require("path");
module.exports = function () {
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
            compiler.plugin('emit', function (compilation, callback) {
                //outPut path
                var distContext = compilation.options.output.path;
                var fileNames = compilation.assets;
                //read all json assets,and get packages from usingComponent


                var globConfig = {
                    baseFromPath: path.relative(context, _this.options.from),
                    compilation: compilation,
                    distContext: distContext,
                    to: _this.options.to
                };
                packages = (0, _preAllfilesName.preAllfilesName)(fileNames, globConfig);
                //read all sourceFile
                var tasks = [];
                packages.forEach(function (item) {
                    var from = _this.options.from;

                    var basePath = path.resolve(context, from);
                    tasks.push((0, _readAllFiles2.default)(basePath, item));
                });

                //write all files
                Promise.all(tasks).then(function (files) {
                    var fileList = _.flatten(files);
                    var writeTasks = [];
                    fileList.forEach(function (file) {
                        writeTasks.push((0, _writeFile.writeFile)(file, globConfig));
                    });
                    return Promise.all(writeTasks);
                }).then(function () {
                    callback();
                }).catch(function (err) {
                    console.error(err);
                });
            });
        }
    }]);

    return WxAppNpmPlugin;
}();