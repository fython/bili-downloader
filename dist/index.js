"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VideoQuality = exports.AudioQuality = exports.BiliDownloader = void 0;
const apis_1 = __importDefault(require("./apis"));
const constants_1 = require("./apis/constants");
Object.defineProperty(exports, "VideoQuality", { enumerable: true, get: function () { return constants_1.VideoQuality; } });
Object.defineProperty(exports, "AudioQuality", { enumerable: true, get: function () { return constants_1.AudioQuality; } });
const fs_1 = __importDefault(require("fs"));
const node_fetch_1 = __importDefault(require("node-fetch"));
const utils_1 = require("./utils");
class BiliDownloader {
    static init(options) {
        var _a;
        BiliDownloader.api.cookie = options.cookie;
        BiliDownloader.api.debug = (_a = options.debug) !== null && _a !== void 0 ? _a : false;
        return BiliDownloader;
    }
    /**
     * 获取某一个用户的所有视频并构建任务
     *
     * @param uid 用户空间 ID
     */
    static getUserVideos(uid) {
        return BiliDownloader.api.getUserVideos(uid)
            .then(page => page.videos.map(video => ({ bv: video.bvid, title: video.title })));
    }
    static getVideo(id) {
        return BiliDownloader.api.getVideoInfo(id)
            .then(info => [
            { bv: info.bvid, title: info.title },
        ]);
    }
    /**
     * 获取某一个收藏列表的所有视频并构建任务
     *
     * @param mid 收藏列表 ID
     */
    static getFavListVideos(mid) {
        return BiliDownloader.api.getFavListVideos(mid)
            .then(list => list.medias.map(video => ({ bv: video.bvid, title: video.title })));
    }
    static bodyStreamToOut(res, out, onProgress) {
        return __awaiter(this, void 0, void 0, function* () {
            yield new Promise((resolve, reject) => {
                const body = res.body;
                if (!body) {
                    reject(new Error('No body'));
                    return;
                }
                let written = 0, lastWritten = 0, bps = 0;
                const interval = 1000;
                let bpsCalcInterval = setInterval(() => {
                    bps = (written - lastWritten) * (1000 / interval);
                    lastWritten = written;
                }, interval);
                body.on('error', err => {
                    clearInterval(bpsCalcInterval);
                    reject(err);
                });
                body.on('finish', () => {
                    clearInterval(bpsCalcInterval);
                    resolve();
                });
                body.on('data', (data) => {
                    out.write(data, () => {
                        written += data.length;
                        onProgress(written, bps);
                    });
                });
            });
        });
    }
    static downloadPlayUrl(task, videoOutPath, audioOutPath) {
        return __awaiter(this, void 0, void 0, function* () {
            const bv = task.root.root.bv;
            console.log(`Task[${bv}] Start downloading`);
            const headers = BiliDownloader.api.mergeHeaders({
                'Referer': `https://www.bilibili.com/video/${bv}`,
            });
            const videoRes = yield node_fetch_1.default(task.videoUrl[0], { headers });
            if (!videoRes.ok) {
                throw new Error(`Cannot get segment file: ${task.videoUrl[0]}`);
            }
            const videoLength = Number(videoRes.headers.get('Content-Length'));
            const videoLengthText = utils_1.bytesToMBytesText(videoLength);
            if (fs_1.default.existsSync(videoOutPath) && fs_1.default.statSync(videoOutPath).size === videoLength) {
                console.log(`Task[${bv}] ${videoOutPath} was downloaded.`);
            }
            else {
                console.log(`Task[${bv}] Downloading video file. Total size: ${videoLengthText}`);
                const videoOut = fs_1.default.createWriteStream(videoOutPath);
                yield BiliDownloader.bodyStreamToOut(videoRes, videoOut, (written, bps) => {
                    const writtenText = utils_1.bytesToMBytesText(written);
                    process.stdout.write(`Progress: ${writtenText} of ${videoLengthText} ` +
                        `(${utils_1.percentText(written, videoLength)} ${utils_1.bytesToSpeedText(bps)})` +
                        '\x1B[0G');
                });
                process.stdout.write(`Finished downloading video part of ${bv} (${videoLengthText})\n`);
            }
            const audioRes = yield node_fetch_1.default(task.audioUrl[0], { headers });
            if (!audioRes.ok) {
                throw new Error(`Cannot get segment file: ${task.audioUrl[0]}`);
            }
            const audioLength = Number(audioRes.headers.get('Content-Length'));
            const audioLengthText = utils_1.bytesToMBytesText(audioLength);
            if (fs_1.default.existsSync(audioOutPath) && fs_1.default.statSync(audioOutPath).size === audioLength) {
                console.log(`Task[${bv}] ${audioOutPath} was downloaded.`);
            }
            else {
                console.log(`Task[${bv}] Downloading audio file. Total size: ${audioLengthText}`);
                const audioOut = fs_1.default.createWriteStream(audioOutPath);
                yield BiliDownloader.bodyStreamToOut(audioRes, audioOut, (written, bps) => {
                    const writtenText = utils_1.bytesToMBytesText(written);
                    process.stdout.write(`Progress: ${writtenText} of ${audioLengthText} ` +
                        `(${utils_1.percentText(written, audioLength)} ${utils_1.bytesToSpeedText(bps)})` +
                        '\x1B[0G');
                });
                process.stdout.write(`Finished downloading audio part of ${bv} (${audioLengthText})\n`);
            }
            console.log(`Task[${bv}] Finished.`);
        });
    }
}
exports.BiliDownloader = BiliDownloader;
BiliDownloader.api = new apis_1.default();
