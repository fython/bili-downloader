"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AudioQuality = exports.VideoQuality = exports.DEFAULT_USER_AGENT = void 0;
exports.DEFAULT_USER_AGENT = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) " +
    "AppleWebKit/537.36 (KHTML, like Gecko) " +
    "Chrome/85.0.4183.121 Safari/537.36";
var VideoQuality;
(function (VideoQuality) {
    VideoQuality[VideoQuality["$240p"] = 6] = "$240p";
    VideoQuality[VideoQuality["$360p"] = 16] = "$360p";
    VideoQuality[VideoQuality["$480p"] = 32] = "$480p";
    VideoQuality[VideoQuality["$720p"] = 63] = "$720p";
    VideoQuality[VideoQuality["$720p60"] = 74] = "$720p60";
    VideoQuality[VideoQuality["$1080p"] = 80] = "$1080p";
    VideoQuality[VideoQuality["$1080p_high"] = 112] = "$1080p_high";
    VideoQuality[VideoQuality["$1080p60"] = 116] = "$1080p60";
    VideoQuality[VideoQuality["$4k"] = 120] = "$4k";
})(VideoQuality = exports.VideoQuality || (exports.VideoQuality = {}));
var AudioQuality;
(function (AudioQuality) {
    AudioQuality[AudioQuality["$64k"] = 30216] = "$64k";
    AudioQuality[AudioQuality["$132k"] = 30232] = "$132k";
    AudioQuality[AudioQuality["$192k"] = 30280] = "$192k";
})(AudioQuality = exports.AudioQuality || (exports.AudioQuality = {}));
