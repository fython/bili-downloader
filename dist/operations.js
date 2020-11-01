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
exports.downloadVideoTasks = exports.downloadPartTasks = exports.downloadTasks = exports.saveWorkbook = exports.filterVideoPartTasksByWorkbook = exports.filterVideoPartTasks = exports.mapVideoPartTasksToWorkbook = exports.filterVideoTasksByWorkbook = exports.filterVideoTasks = exports.mapVideoTasksToWorkbook = exports.mapToVideoPlayUrls = exports.mapToVideoParts = void 0;
const index_1 = require("./index");
const constants_1 = require("./apis/constants");
const exceljs_1 = __importDefault(require("exceljs"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const utils_1 = require("./utils");
const VIDEO_TASKS_COLUMNS = [
    { header: 'BV', key: 'bv', width: 10 },
    { header: 'Title', key: 'title', width: 80 },
    { header: 'Chosen', key: 'chosen', width: 6 },
];
const VIDEO_PART_TASKS_COLUMNS = [
    { header: 'BV', key: 'bv', width: 10 },
    { header: 'CID', key: 'cid', width: 15 },
    { header: 'Title', key: 'title', width: 80 },
    { header: 'Part', key: 'part', width: 50 },
    { header: 'Chosen', key: 'chosen', width: 6 },
];
function mapToVideoParts() {
    const api = index_1.BiliDownloader.api;
    return (source) => __awaiter(this, void 0, void 0, function* () {
        const res = [];
        for (const task of source) {
            const pages = yield api.getVideoPagesList({ bv: task.bv });
            res.push(...pages.map(page => ({
                root: task,
                cid: page.cid,
                name: page.part
            })));
        }
        return res;
    });
}
exports.mapToVideoParts = mapToVideoParts;
function mapToVideoPlayUrls(preferVideoQuality, preferAudioQuality) {
    const api = index_1.BiliDownloader.api;
    const videoQualityPrefer = preferVideoQuality !== null && preferVideoQuality !== void 0 ? preferVideoQuality : constants_1.VideoQuality.$4k;
    const audioQualityPrefer = preferAudioQuality !== null && preferAudioQuality !== void 0 ? preferAudioQuality : constants_1.AudioQuality.$192k;
    return (source) => __awaiter(this, void 0, void 0, function* () {
        const res = [];
        for (const task of source) {
            const playUrl = yield api.getVideoPlayUrl({ bv: task.root.bv }, task.cid);
            const videoSegments = playUrl.dash.video.sort((a, b) => a.id - b.id);
            const audioSegments = playUrl.dash.audio.sort((a, b) => a.id - b.id);
            let preferVideoSegment = playUrl.dash.video[0];
            let preferAudioSegment = playUrl.dash.audio[0];
            for (const seg of videoSegments) {
                if (seg.id <= videoQualityPrefer) {
                    preferVideoSegment = seg;
                }
            }
            for (const seg of audioSegments) {
                if (seg.id <= audioQualityPrefer) {
                    preferAudioSegment = seg;
                }
            }
            res.push({
                root: task,
                videoQuality: preferVideoSegment.id,
                audioQuality: preferAudioSegment.id,
                videoUrl: [preferVideoSegment.baseUrl, ...preferVideoSegment.backupUrl],
                audioUrl: [preferAudioSegment.baseUrl, ...preferAudioSegment.backupUrl],
            });
        }
        return res;
    });
}
exports.mapToVideoPlayUrls = mapToVideoPlayUrls;
function mapVideoTasksToWorkbook() {
    return (source) => __awaiter(this, void 0, void 0, function* () {
        const workbook = new exceljs_1.default.Workbook();
        workbook.creator = 'BiliDownloader';
        workbook.created = new Date();
        const sheet = workbook.addWorksheet('Tasks');
        sheet.columns = VIDEO_TASKS_COLUMNS;
        sheet.addRows(source.map(item => ({
            bv: item.bv,
            title: item.title,
            chosen: 1,
        })));
        return workbook;
    });
}
exports.mapVideoTasksToWorkbook = mapVideoTasksToWorkbook;
function filterVideoTasks(filter) {
    return (source) => __awaiter(this, void 0, void 0, function* () {
        return source.filter(item => filter(item));
    });
}
exports.filterVideoTasks = filterVideoTasks;
function filterVideoTasksByWorkbook(bookPath) {
    return (source) => __awaiter(this, void 0, void 0, function* () {
        const workbook = new exceljs_1.default.Workbook();
        yield workbook.xlsx.readFile(bookPath);
        const sheet = workbook.getWorksheet('Tasks');
        sheet.columns = VIDEO_TASKS_COLUMNS;
        const excludedTasks = [];
        for (let i = 2; i <= sheet.rowCount; i++) {
            const row = sheet.getRow(i);
            if (row.getCell('chosen').value === '0') {
                excludedTasks.push(row.getCell('bv').value);
            }
        }
        return source.filter(item => item.bv in excludedTasks);
    });
}
exports.filterVideoTasksByWorkbook = filterVideoTasksByWorkbook;
function mapVideoPartTasksToWorkbook() {
    return (source) => __awaiter(this, void 0, void 0, function* () {
        const workbook = new exceljs_1.default.Workbook();
        workbook.creator = 'BiliDownloader';
        workbook.created = new Date();
        const sheet = workbook.addWorksheet('Tasks');
        sheet.columns = VIDEO_PART_TASKS_COLUMNS;
        sheet.addRows(source.map(item => ({
            bv: item.root.bv,
            cid: item.cid,
            title: item.root.title,
            part: item.name,
            chosen: 1,
        })));
        return workbook;
    });
}
exports.mapVideoPartTasksToWorkbook = mapVideoPartTasksToWorkbook;
function filterVideoPartTasks(filter) {
    return (source) => __awaiter(this, void 0, void 0, function* () {
        return source.filter(item => filter(item));
    });
}
exports.filterVideoPartTasks = filterVideoPartTasks;
function filterVideoPartTasksByWorkbook(bookPath) {
    return (source) => __awaiter(this, void 0, void 0, function* () {
        const workbook = new exceljs_1.default.Workbook();
        yield workbook.xlsx.readFile(bookPath);
        const sheet = workbook.getWorksheet('Tasks');
        sheet.columns = VIDEO_PART_TASKS_COLUMNS;
        const excludedTasks = [];
        for (let i = 2; i <= sheet.rowCount; i++) {
            const row = sheet.getRow(i);
            if (row.getCell('chosen').value === '0') {
                const bv = row.getCell('bv').value;
                const cid = row.getCell('cid').value;
                excludedTasks.push(`${bv}-${cid}`);
            }
        }
        return source.filter(item => `${item.root.bv}-${item.cid}` in excludedTasks);
    });
}
exports.filterVideoPartTasksByWorkbook = filterVideoPartTasksByWorkbook;
function saveWorkbook(outPath, overwrite) {
    return (source) => __awaiter(this, void 0, void 0, function* () {
        if (!overwrite && fs_1.default.existsSync(outPath)) {
            throw new Error(`File ${outPath} exists`);
        }
        yield source.xlsx.writeFile(outPath);
        return true;
    });
}
exports.saveWorkbook = saveWorkbook;
function downloadTasks(dirPath) {
    const resolvedPath = path_1.default.resolve(dirPath);
    if (!fs_1.default.existsSync(resolvedPath)) {
        throw new Error(`Directory ${resolvedPath} doesn't exist.`);
    }
    return (source) => __awaiter(this, void 0, void 0, function* () {
        const pairs = [];
        for (const task of source) {
            const bv = task.root.root.bv;
            const title = task.root.root.title;
            const videoPath = path_1.default.join(resolvedPath, `${bv}-${utils_1.escapeDirName(title)}`);
            if (!fs_1.default.existsSync(videoPath)) {
                fs_1.default.mkdirSync(videoPath);
            }
            const videoFilePath = path_1.default.join(videoPath, `${utils_1.escapeDirName(task.root.name)}.mp4`);
            const audioFilePath = path_1.default.join(videoPath, `${utils_1.escapeDirName(task.root.name)}.m4a`);
            yield index_1.BiliDownloader.downloadPlayUrl(task, videoFilePath, audioFilePath);
            pairs.push({ videoPath: videoFilePath, audioPath: audioFilePath });
        }
        return pairs;
    });
}
exports.downloadTasks = downloadTasks;
function downloadPartTasks(dirPath, preferVideoQuality, preferAudioQuality) {
    return (source) => __awaiter(this, void 0, void 0, function* () {
        return yield mapToVideoPlayUrls(preferVideoQuality, preferAudioQuality)(source)
            .then(downloadTasks(dirPath));
    });
}
exports.downloadPartTasks = downloadPartTasks;
function downloadVideoTasks(dirPath, preferVideoQuality, preferAudioQuality) {
    return (source) => __awaiter(this, void 0, void 0, function* () {
        return yield mapToVideoParts()(source)
            .then(mapToVideoPlayUrls(preferVideoQuality, preferAudioQuality))
            .then(downloadTasks(dirPath));
    });
}
exports.downloadVideoTasks = downloadVideoTasks;
