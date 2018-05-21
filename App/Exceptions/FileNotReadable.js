"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var FileNotReadable = /** @class */ (function (_super) {
    __extends(FileNotReadable, _super);
    function FileNotReadable(sysErrNum) {
        if (sysErrNum === void 0) { sysErrNum = -1; }
        var _this = _super.call(this) || this;
        _this.systemErrorCode = sysErrNum;
        return _this;
    }
    FileNotReadable.prototype.toString = function () {
        return "File is not readable. ERR: " + this.systemErrorCode;
    };
    return FileNotReadable;
}(Error));
exports.FileNotReadable = FileNotReadable;
