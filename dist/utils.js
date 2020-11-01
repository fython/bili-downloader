"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.escapeDirName = exports.percentText = exports.bytesToSpeedText = exports.bytesToMBytesText = void 0;
function bytesToMBytesText(n) {
    return `${(n / 1024 / 1024).toFixed(2)}MB`;
}
exports.bytesToMBytesText = bytesToMBytesText;
function bytesToSpeedText(n) {
    if (n < 1024) {
        return `${n}B/s`;
    }
    else if (n < 1024 * 1024) {
        return `${(n / 1024).toFixed(2)}KB/s`;
    }
    else {
        return `${(n / 1024 / 1024).toFixed(2)}MB/s`;
    }
}
exports.bytesToSpeedText = bytesToSpeedText;
function percentText(current, max) {
    return `${(current / max * 100).toFixed(2)}%`;
}
exports.percentText = percentText;
function escapeDirName(name) {
    return name.replace(/\//g, '_')
        .replace(/ /g, '_')
        .replace(/\\/g, '_');
}
exports.escapeDirName = escapeDirName;
