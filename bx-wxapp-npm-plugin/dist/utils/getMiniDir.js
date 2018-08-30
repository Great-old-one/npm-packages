"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

exports.default = function (filePath) {
    var absolutepath = path.resolve(filePath, "package.json");
    var dir = "miniprogram_dist";
    try {
        var config = require(absolutepath);
        if (config && config.miniprogram && typeof config.miniprogram === "string") {
            dir = config.miniprogram;
        }
    } catch (e) {
        console.log(e);
    }
    return dir;
};

var path = require("path");